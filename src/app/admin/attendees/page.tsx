'use client';

import { useState } from 'react';
import { useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { batchImportAttendees, getPreloadedAttendees, deletePreloadedAttendee } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Upload, Trash2 } from 'lucide-react';
import { ERA_OPTIONS } from '@/lib/types';
import type { PreloadedAttendee } from '@/lib/types';
import { useEffect } from 'react';

interface ParsedRow {
  name: string;
  graduationYear: number | null;
  era: string;
  valid: boolean;
  error?: string;
}

export default function AdminAttendeesPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [existing, setExisting] = useState<PreloadedAttendee[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPreloadedAttendees().then(setExisting);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = (result.data as any[]).map((row): ParsedRow => {
          const name = (row.name || '').trim();
          const rawYear = (row.graduationYear || '').toString().trim();
          const parsedYear = rawYear === '' ? null : parseInt(rawYear, 10);
          const graduationYear = (parsedYear !== null && isNaN(parsedYear)) ? null : parsedYear;
          const era = (row.era || '').trim();

          if (!name) return { name, graduationYear, era, valid: false, error: 'Name is required' };
          if (graduationYear !== null && (graduationYear < 1960)) {
            return { name, graduationYear, era, valid: false, error: 'Year must be 1960 or later' };
          }
          if (!ERA_OPTIONS.includes(era as any)) {
            return { name, graduationYear, era, valid: false, error: `Era must be one of: ${ERA_OPTIONS.join(', ')}` };
          }
          return { name, graduationYear, era, valid: true };
        });
        setRows(parsed);
      },
    });
  };

  const handleImport = async () => {
    const valid = rows.filter((r) => r.valid);
    if (valid.length === 0) { toast.error('No valid rows to import.'); return; }
    setImporting(true);
    try {
      await batchImportAttendees(valid);
      const updated = await getPreloadedAttendees();
      setExisting(updated);
      setRows([]);
      toast.success(`Imported ${valid.length} attendees!`);
    } catch {
      toast.error('Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (attendee: PreloadedAttendee) => {
    const label = attendee.matched
      ? `${attendee.name} has already claimed their account. Delete anyway?`
      : `Delete ${attendee.name}?`;
    if (!confirm(label)) return;
    try {
      await deletePreloadedAttendee(attendee.id);
      setExisting((prev) => prev.filter((a) => a.id !== attendee.id));
      toast.success('Attendee removed.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Attendees</h1>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
        <h2 className="font-bold text-neutral-900">Import from CSV</h2>
        <p className="text-sm text-neutral-600">
          Upload a CSV with three columns: <code className="bg-neutral-100 px-1 rounded">name</code>,{' '}
          <code className="bg-neutral-100 px-1 rounded">graduationYear</code> (optional — leave blank for guests),{' '}
          <code className="bg-neutral-100 px-1 rounded">era</code> — no email addresses needed or accepted.
          Years must be 1960 or later (no upper limit).
        </p>
        <div className="bg-neutral-50 rounded-xl p-3 text-xs font-mono text-neutral-600 border border-neutral-200">
          name,graduationYear,era<br />
          Jane Smith,1998,90s<br />
          John Doe,2028,20s<br />
          Guest Speaker,,Guest
        </div>

        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />Choose CSV File
        </Button>

        {rows.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-3 text-sm">
              <span className="text-green-600 font-semibold">{validCount} valid</span>
              {invalidCount > 0 && <span className="text-error font-semibold">{invalidCount} invalid (will be skipped)</span>}
            </div>
            <div className="overflow-x-auto max-h-60 border border-neutral-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-600">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-600">Year</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-600">Era</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-t border-neutral-100 ${!row.valid ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.graduationYear ?? '—'}</td>
                      <td className="px-3 py-2">{row.era}</td>
                      <td className="px-3 py-2">
                        {row.valid
                          ? <span className="text-green-600">✓</span>
                          : <span className="text-error">{row.error}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleImport} loading={importing} disabled={validCount === 0}>
              Import {validCount} Attendees
            </Button>
          </div>
        )}
      </div>

      {/* Existing attendees */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="font-bold text-neutral-900 mb-3">Pre-loaded Attendees ({existing.length})</h2>
        {existing.length === 0 ? (
          <p className="text-sm text-neutral-400">No attendees imported yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-neutral-600">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-neutral-600">Year</th>
                  <th className="px-3 py-2 text-left font-semibold text-neutral-600">Era</th>
                  <th className="px-3 py-2 text-left font-semibold text-neutral-600">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {existing.map((a) => (
                  <tr key={a.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2 font-medium">{a.name}</td>
                    <td className="px-3 py-2 text-neutral-500">{a.graduationYear ?? '—'}</td>
                    <td className="px-3 py-2 text-neutral-500">{a.era}</td>
                    <td className="px-3 py-2">
                      {a.matched
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Claimed</span>
                        : <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">Not on app yet</span>
                      }
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleDelete(a)}
                        className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                        aria-label={`Delete ${a.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { subscribeToConcertProgram, createConcertEntry, updateConcertEntry, deleteConcertEntry } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Trash2, ChevronUp, ChevronDown, Plus, Pencil, X, Check } from 'lucide-react';
import type { ConcertProgramEntry, ConcertEntryType } from '@/lib/types';

const schema = z.object({
  type: z.enum(['current-group', 'era', 'mixed-era', 'video', 'all-group']),
  label: z.string().min(1),
  songs: z.string(),
  soloists: z.string(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TYPE_LABELS: Record<ConcertEntryType, string> = {
  'current-group': 'Current Group',
  'era': 'Era',
  'mixed-era': 'Mixed Era',
  'video': 'Video Interlude',
  'all-group': 'All Ephlats',
};

const TYPE_LABEL_DEFAULTS: Record<ConcertEntryType, string> = {
  'current-group': 'The 2026 Ephlats',
  'era': '1990s',
  'mixed-era': '90s & 00s',
  'video': 'Video Interlude',
  'all-group': 'All Ephlats',
};

export default function AdminConcertPage() {
  const [entries, setEntries] = useState<ConcertProgramEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsub = subscribeToConcertProgram((e) => setEntries(e));
    return () => unsub();
  }, []);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'era', songs: '', soloists: '' },
  });

  const watchedType = watch('type') as ConcertEntryType;

  const onSubmit = async (data: FormData) => {
    try {
      const songs = data.songs.split('\n').map((s) => s.trim()).filter(Boolean);
      const soloists = data.soloists.split('\n').map((s) => s.trim()).filter(Boolean);
      await createConcertEntry({
        type: data.type as ConcertEntryType,
        label: data.label,
        songs,
        soloists,
        notes: data.notes || null,
        order: entries.length + 1,
      });
      reset({ type: 'era', songs: '', soloists: '' });
      setShowAddForm(false);
      toast.success('Entry added!');
    } catch {
      toast.error('Failed to add entry.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await deleteConcertEntry(id);
    toast.success('Entry deleted.');
  };

  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    await updateConcertEntry(entries[idx].id, { order: idx });
    await updateConcertEntry(entries[idx - 1].id, { order: idx + 1 });
  };

  const handleMoveDown = async (idx: number) => {
    if (idx >= entries.length - 1) return;
    await updateConcertEntry(entries[idx].id, { order: idx + 2 });
    await updateConcertEntry(entries[idx + 1].id, { order: idx + 1 });
  };

  const typeOptions = (Object.entries(TYPE_LABELS) as [ConcertEntryType, string][]).map(([v, l]) => ({ value: v, label: l }));
  const isVideo = watchedType === 'video';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Concert Program</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-1.5" />Add Entry
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h2 className="font-bold text-neutral-900 mb-4">New Program Entry</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Select
              label="Type"
              options={typeOptions}
              {...register('type', {
                onChange: (e) => setValue('label', TYPE_LABEL_DEFAULTS[e.target.value as ConcertEntryType] || ''),
              })}
            />
            <Input label="Label (display name)" error={errors.label?.message} {...register('label')} />
            {!isVideo && (
              <>
                <Textarea
                  label="Songs (one per line)"
                  rows={3}
                  placeholder="Song title&#10;Another song"
                  {...register('songs')}
                />
                <Textarea
                  label="Soloists (one per line, optional)"
                  rows={2}
                  placeholder="Jane Smith '98&#10;John Doe '01"
                  {...register('soloists')}
                />
              </>
            )}
            <Input label="Notes (optional)" {...register('notes')} />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)} fullWidth>Cancel</Button>
              <Button type="submit" loading={isSubmitting} fullWidth>Add to Program</Button>
            </div>
          </form>
        </div>
      )}

      {/* Program list */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 bg-white rounded-2xl border border-neutral-200">
            <p className="text-2xl mb-2">🎵</p>
            <p>No program entries yet. Add some above.</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <ProgramRow
              key={entry.id}
              entry={entry}
              idx={idx}
              total={entries.length}
              onDelete={() => handleDelete(entry.id)}
              onMoveUp={() => handleMoveUp(idx)}
              onMoveDown={() => handleMoveDown(idx)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProgramRow({ entry, idx, total, onDelete, onMoveUp, onMoveDown }: {
  entry: ConcertProgramEntry;
  idx: number;
  total: number;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editLabel, setEditLabel] = useState(entry.label);
  const [editType, setEditType] = useState<ConcertEntryType>(entry.type);
  const [editSongs, setEditSongs] = useState(entry.songs.join('\n'));
  const [editSoloists, setEditSoloists] = useState(entry.soloists.join('\n'));
  const [editNotes, setEditNotes] = useState(entry.notes || '');

  const handleSave = async () => {
    if (!editLabel.trim()) return;
    setSaving(true);
    try {
      await updateConcertEntry(entry.id, {
        label: editLabel.trim(),
        type: editType,
        songs: editSongs.split('\n').map((s) => s.trim()).filter(Boolean),
        soloists: editSoloists.split('\n').map((s) => s.trim()).filter(Boolean),
        notes: editNotes.trim() || null,
      });
      setEditing(false);
    } catch {
      // leave editing open on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLabel(entry.label);
    setEditType(entry.type);
    setEditSongs(entry.songs.join('\n'));
    setEditSoloists(entry.soloists.join('\n'));
    setEditNotes(entry.notes || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-purple-primary/30 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-neutral-400">#{idx + 1}</span>
          <span className="text-sm font-semibold text-purple-primary">Editing</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-500 block mb-1">Type</label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as ConcertEntryType)}
              className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary"
            >
              {(Object.entries(TYPE_LABELS) as [ConcertEntryType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 block mb-1">Label</label>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary"
            />
          </div>
        </div>
        {editType !== 'video' && (
          <>
            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Songs (one per line)</label>
              <textarea
                value={editSongs}
                onChange={(e) => setEditSongs(e.target.value)}
                rows={3}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Soloists (one per line)</label>
              <textarea
                value={editSoloists}
                onChange={(e) => setEditSoloists(e.target.value)}
                rows={2}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary resize-none"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-xs font-semibold text-neutral-500 block mb-1">Notes (optional)</label>
          <input
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !editLabel.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-purple-primary text-white disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-start gap-3">
      <div className="flex flex-col gap-1">
        <button onClick={onMoveUp} disabled={idx === 0} className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 min-h-[28px] min-w-[28px] flex items-center justify-center">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={onMoveDown} disabled={idx >= total - 1} className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 min-h-[28px] min-w-[28px] flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-400">#{idx + 1}</span>
          <span className="font-semibold text-neutral-900">{entry.label}</span>
          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[entry.type]}
          </span>
        </div>
        {entry.songs.length > 0 && (
          <p className="text-sm text-neutral-500 mt-1 italic">{entry.songs.join(', ')}</p>
        )}
        {entry.soloists.length > 0 && (
          <p className="text-xs text-neutral-400 mt-0.5">Soloists: {entry.soloists.join(', ')}</p>
        )}
      </div>
      <div className="flex items-center">
        <button onClick={() => setEditing(true)} className="text-neutral-300 hover:text-purple-primary min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="text-neutral-300 hover:text-error min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

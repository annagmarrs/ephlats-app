'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { PreloadedAttendee } from '@/lib/types';

interface Props {
  name: string;
  graduationYear: number | null;
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

export function StepIdentify({ name, graduationYear, userId, onNext, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState(name.split(' ')[0] || '');
  const [allCandidates, setAllCandidates] = useState<PreloadedAttendee[]>([]);
  const [results, setResults] = useState<PreloadedAttendee[]>([]);
  const [selected, setSelected] = useState<PreloadedAttendee | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all unmatched attendees — name search is done client-side
    const loadCandidates = async () => {
      try {
        const q = query(
          collection(db, 'preloadedAttendees'),
          where('matched', '!=', true)
        );
        const snap = await getDocs(q);
        const candidates = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PreloadedAttendee));
        setAllCandidates(candidates);
        setResults(fuzzySearch(searchQuery, candidates).slice(0, 10));
      } catch {
        setAllCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  useEffect(() => {
    setResults(fuzzySearch(searchQuery, allCandidates).slice(0, 10));
  }, [searchQuery, allCandidates]);

  function fuzzySearch(q: string, candidates: PreloadedAttendee[]): PreloadedAttendee[] {
    if (!q.trim()) return candidates;
    const tokens = q.toLowerCase().trim().split(/\s+/);
    return candidates
      .map((c) => {
        const nameTokens = c.name.toLowerCase().split(/\s+/);
        let score = 0;
        for (const qt of tokens) {
          for (const nt of nameTokens) {
            if (nt.startsWith(qt.slice(0, 3))) score += 1;
            if (nt === qt) score += 2;
          }
        }
        return { ...c, score };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    try {
      const res = await fetch('/api/claim-attendee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preloadedId: selected.id, userId }),
      });
      if (!res.ok) throw new Error('Failed to claim');
      onNext();
    } catch {
      setConfirming(false);
    }
  };

  if (selected) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <h2 className="text-2xl font-bold text-neutral-900">Is this you?</h2>
        <div className="bg-purple-light rounded-2xl p-5">
          <p className="text-lg font-bold text-purple-primary">{selected.name}</p>
          <p className="text-neutral-600">{selected.era} era{selected.graduationYear ? ` · Class of ${selected.graduationYear}` : ''}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSelected(null)} fullWidth>Not me</Button>
          <Button onClick={handleConfirm} loading={confirming} fullWidth>Yes, that's me!</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Are you in our list?</h2>
        <p className="text-neutral-600 mt-1">We've pre-loaded expected attendees. Find yourself to connect your profile.</p>
        <p className="text-sm text-neutral-400 mt-1">If your name looks different (nickname, maiden name), search for it.</p>
      </div>

      <Input
        label="Search by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Your first or last name"
      />

      {loading ? (
        <p className="text-sm text-neutral-400">Searching…</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-neutral-500">No matches found. Try a different spelling or skip below.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="w-full text-left bg-white border border-neutral-200 rounded-xl p-4 hover:border-purple-primary transition-colors min-h-[56px]"
            >
              <p className="font-semibold text-neutral-900">{r.name}</p>
              <p className="text-sm text-neutral-500">{r.graduationYear ? `Class of ${r.graduationYear} · ` : ''}{r.era}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="secondary" onClick={onBack} fullWidth>Back</Button>
        <Button variant="ghost" onClick={onNext} fullWidth>
          I don't see myself
        </Button>
      </div>
    </div>
  );
}

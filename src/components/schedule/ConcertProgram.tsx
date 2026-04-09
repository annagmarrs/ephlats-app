'use client';

import { useState, useEffect } from 'react';
import { subscribeToConcertProgram } from '@/lib/firestore';
import type { ConcertProgramEntry } from '@/lib/types';

const NUMBER_CIRCLES = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];

export function ConcertProgram() {
  const [entries, setEntries] = useState<ConcertProgramEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToConcertProgram((e) => { setEntries(e); setLoading(false); });
    return () => unsub();
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200">
      {/* Header */}
      <div
        style={{ background: 'linear-gradient(135deg, #4A1F62 0%, #6B2D8B 100%)' }}
        className="px-5 py-4 flex items-center gap-2"
      >
        <span className="text-xl">🎵</span>
        <h2 className="text-white text-lg font-bold">Tonight's Program</h2>
      </div>

      {/* Body */}
      <div style={{ backgroundColor: '#FAFAF7' }}>
        {loading ? (
          <div className="p-6 text-center text-neutral-400">Loading program…</div>
        ) : entries.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-4 px-4 bg-white rounded-2xl border border-neutral-200">
              <p className="text-2xl mb-2">🎵</p>
              <p className="font-semibold text-neutral-700">The concert program will be posted here before the show.</p>
              <p className="text-sm text-neutral-400 mt-1">Check back soon!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {entries.map((entry, idx) => (
              <ProgramEntry key={entry.id} entry={entry} number={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramEntry({ entry, number }: { entry: ConcertProgramEntry; number: number }) {
  const circle = NUMBER_CIRCLES[number - 1] || `${number}.`;

  const isAllGroup = entry.type === 'all-group';
  const isVideo = entry.type === 'video';

  return (
    <div className={`px-5 py-4 ${isAllGroup ? 'bg-gold-light' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-gold-dark text-lg font-bold flex-shrink-0 mt-0.5">{circle}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-neutral-900 text-base leading-snug">{entry.label}</p>
          {isVideo && (
            <p className="text-sm text-neutral-500 italic mt-0.5">Video Interlude</p>
          )}
          {!isVideo && entry.songs.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {entry.songs.map((song, i) => (
                <li key={i} className="text-sm text-neutral-600 italic">{song}</li>
              ))}
            </ul>
          )}
          {entry.soloists.length > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Soloists: {entry.soloists.join(', ')}
            </p>
          )}
          {entry.notes && (
            <p className="text-xs text-neutral-400 mt-1 italic">{entry.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

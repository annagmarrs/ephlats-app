'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { subscribeToMusic } from '@/lib/firestore';
import { EraBadge } from '@/components/ui/Badge';
import type { Music } from '@/lib/types';
import type { Era } from '@/lib/types';

export function SheetMusicSection() {
  const [music, setMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToMusic((m) => { setMusic(m); setLoading(false); });
    return () => unsub();
  }, []);

  if (loading || music.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-neutral-200">
        <h3 className="font-bold text-neutral-900">Sheet Music</h3>
      </div>
      <div className="divide-y divide-neutral-100">
        {music.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 text-sm">{m.title}</p>
              {m.era && <EraBadge era={m.era as Era} />}
            </div>
            <a
              href={m.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-purple-primary hover:text-purple-dark min-h-[44px] min-w-[44px] justify-end"
            >
              Open <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

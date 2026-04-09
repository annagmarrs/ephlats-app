'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EventCard } from './EventCard';
import type { ScheduleEvent } from '@/lib/types';

interface Props {
  label: string;
  events: ScheduleEvent[];
}

export function DaySection({ label, events }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full sticky top-14 z-20 bg-gold-light px-4 py-2.5 border-b border-gold-primary/30 flex items-center justify-between min-h-[44px]"
        aria-expanded={open}
      >
        <h2 className="text-sm font-bold text-yellow-800 uppercase tracking-wide">{label}</h2>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="p-4 space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-neutral-400 py-4 text-center">No events scheduled.</p>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      )}
    </div>
  );
}

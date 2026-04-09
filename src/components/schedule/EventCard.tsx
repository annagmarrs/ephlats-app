'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { EventTypeBadge } from './EventTypeBadge';
import type { ScheduleEvent } from '@/lib/types';
import { EVENT_COLORS } from '@/lib/types';

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function EventCard({ event }: { event: ScheduleEvent }) {
  if (event.type === 'concert') {
    return (
      <Link href={`/schedule/${event.id}`} className="block">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <div
            style={{ background: 'linear-gradient(135deg, #4A1F62 0%, #6B2D8B 60%, #8B3DAF 100%)' }}
            className="px-5 pt-5 pb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎵</span>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#FFCD00' }}>
                The Main Event
              </span>
            </div>
            <h3 className="text-white text-xl font-bold leading-tight">{event.title}</h3>
            <p className="text-purple-200 text-sm mt-1">
              Saturday, April 18 · {formatTime(event.startTime)}
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <div className="flex items-center gap-2 text-neutral-600 text-sm mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
            <p className="text-neutral-600 text-sm">{event.description}</p>
            <div
              className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: '#FFCD00', color: '#1a1a1a' }}
            >
              <span>🎟</span>
              <span>Please arrive at 6:30 PM for seating</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  const colors = EVENT_COLORS[event.type];

  return (
    <Link href={`/schedule/${event.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex hover:shadow-md active:scale-[0.99] transition-all">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: colors.border }} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-neutral-900 leading-snug flex-1">{event.title}</h3>
            <EventTypeBadge type={event.type} />
          </div>
          <p className="text-sm text-neutral-600 mt-1">
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

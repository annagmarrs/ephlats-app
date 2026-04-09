'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Clock } from 'lucide-react';
import { getEvent } from '@/lib/firestore';
import { TopHeader } from '@/components/layout/TopHeader';
import { EventTypeBadge } from '@/components/schedule/EventTypeBadge';
import { ConcertProgram } from '@/components/schedule/ConcertProgram';
import { SheetMusicSection } from '@/components/schedule/SheetMusicSection';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import type { ScheduleEvent } from '@/lib/types';

function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvent(eventId).then((e) => { setEvent(e); setLoading(false); });
  }, [eventId]);

  if (loading) return <PageLoader />;
  if (!event) return (
    <>
      <TopHeader title="Event" showBack backHref="/schedule" />
      <div className="p-4 text-center text-neutral-400">Event not found.</div>
    </>
  );

  return (
    <>
      <TopHeader title={event.title} showBack backHref="/schedule" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-neutral-900 flex-1">{event.title}</h1>
            <EventTypeBadge type={event.type} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-600 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0 text-neutral-400" />
              <span>{formatDate(event.date)} · {formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
            </div>
            <div className="flex items-start gap-2 text-neutral-600 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0 text-neutral-400 mt-0.5" />
              <span>{event.location}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line border-t border-neutral-100 pt-3">
              {event.description}
            </p>
          )}
        </div>

        {event.isConcert && (
          <>
            <ConcertProgram />
            <SheetMusicSection />
          </>
        )}
      </div>
    </>
  );
}

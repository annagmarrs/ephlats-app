import { EventCard } from './EventCard';
import type { ScheduleEvent } from '@/lib/types';

interface Props {
  label: string;
  events: ScheduleEvent[];
}

export function DaySection({ label, events }: Props) {
  return (
    <div>
      <div className="sticky top-14 z-20 bg-neutral-100 px-4 py-2 border-b border-neutral-200">
        <h2 className="text-sm font-bold text-neutral-600 uppercase tracking-wide">{label}</h2>
      </div>
      <div className="p-4 space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4 text-center">No events scheduled.</p>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}

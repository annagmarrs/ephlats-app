import type { EventType } from '@/lib/types';
import { EVENT_COLORS } from '@/lib/types';

const LABELS: Record<EventType, string> = {
  rehearsal: 'Rehearsal',
  social: 'Social',
  concert: 'Concert',
  meal: 'Meal',
  logistics: 'Logistics',
};

export function EventTypeBadge({ type }: { type: EventType }) {
  const { badge } = EVENT_COLORS[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${badge}`}>
      {LABELS[type]}
    </span>
  );
}

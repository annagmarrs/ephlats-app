'use client';

import { useSchedule } from '@/hooks/useSchedule';
import { TopHeader } from '@/components/layout/TopHeader';
import { DaySection } from '@/components/schedule/DaySection';
import { EventCardSkeleton } from '@/components/ui/SkeletonLoader';

const DAYS = [
  { date: '2026-04-17', label: 'Friday, April 17' },
  { date: '2026-04-18', label: 'Saturday, April 18' },
  { date: '2026-04-19', label: 'Sunday, April 19' },
];

export default function SchedulePage() {
  const { eventsByDay, loading } = useSchedule();

  return (
    <>
      <TopHeader title="Weekend Schedule" />
      <div className="pb-2">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
          DAYS.map(({ date, label }) => (
            <DaySection
              key={date}
              label={label}
              events={eventsByDay[date] || []}
            />
          ))
        )}
      </div>
    </>
  );
}

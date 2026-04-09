'use client';

import { useState, useEffect } from 'react';
import { subscribeToSchedule } from '@/lib/firestore';
import type { ScheduleEvent } from '@/lib/types';

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToSchedule((items) => {
      setEvents(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const eventsByDay = events.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  return { events, eventsByDay, loading };
}

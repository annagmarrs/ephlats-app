'use client';

import { useState, useEffect } from 'react';
import { subscribeToAnnouncements } from '@/lib/firestore';
import type { Announcement } from '@/lib/types';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAnnouncements((items) => {
      setAnnouncements(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { announcements, loading };
}

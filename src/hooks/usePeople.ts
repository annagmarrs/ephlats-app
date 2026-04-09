'use client';

import { useState, useEffect } from 'react';
import { subscribeToUsers, getPreloadedAttendees } from '@/lib/firestore';
import type { User, PreloadedAttendee } from '@/lib/types';

export function usePeople() {
  const [users, setUsers] = useState<User[]>([]);
  const [preloaded, setPreloaded] = useState<PreloadedAttendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let usersLoaded = false;
    let preloadedLoaded = false;

    const checkDone = () => {
      if (usersLoaded && preloadedLoaded) setLoading(false);
    };

    const unsub = subscribeToUsers((u) => {
      setUsers(u);
      usersLoaded = true;
      checkDone();
    });

    getPreloadedAttendees().then((p) => {
      setPreloaded(p);
      preloadedLoaded = true;
      checkDone();
    });

    return () => unsub();
  }, []);

  return { users, preloaded, loading };
}

'use client';

import { useState } from 'react';
import { requestNotificationPermission } from '@/lib/notifications';

export function useNotifications(userId: string | undefined) {
  const [loading, setLoading] = useState(false);

  const enable = async (): Promise<boolean> => {
    if (!userId) return false;
    setLoading(true);
    const result = await requestNotificationPermission(userId);
    setLoading(false);
    return result;
  };

  return { enable, loading };
}

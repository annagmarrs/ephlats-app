'use client';

import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestNotificationPermission } from '@/lib/notifications';
import { isIOSVersionTooOld } from '@/lib/notifications';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface Props {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

export function StepNotifications({ userId, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const tooOld = typeof window !== 'undefined' && isIOSVersionTooOld();

  const handleEnable = async () => {
    setLoading(true);
    const success = await requestNotificationPermission(userId);
    setLoading(false);
    if (success) {
      toast.success('Notifications enabled!');
    } else {
      toast.error('Could not enable notifications. You can try again in Settings.');
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-purple-light flex items-center justify-center">
          <Bell className="w-10 h-10 text-purple-primary" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Stay in the loop</h2>
        <p className="text-neutral-600 mt-2">
          We'll notify you about event updates, messages, and announcements. You can change this anytime.
        </p>
        {tooOld && (
          <p className="text-sm text-amber-600 mt-3 bg-amber-50 rounded-xl p-3">
            To receive push notifications, update to iOS 16.4 or later.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={handleEnable} loading={loading} fullWidth size="lg">
          Enable Notifications
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} fullWidth>Back</Button>
          <Button variant="ghost" onClick={onNext} fullWidth>Not now</Button>
        </div>
      </div>
    </div>
  );
}

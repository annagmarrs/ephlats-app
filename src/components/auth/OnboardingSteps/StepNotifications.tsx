'use client';

import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestNotificationPermission, isIOSVersionTooOld } from '@/lib/notifications';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';

interface Props {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

function getNotificationSupport(): 'supported' | 'ios-not-installed' | 'ios-too-old' | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  if (isIOS) {
    const isInstalled = (window.navigator as any).standalone === true;
    if (!isInstalled) return 'ios-not-installed';
    if (isIOSVersionTooOld()) return 'ios-too-old';
  }
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  return 'supported';
}

export function StepNotifications({ userId, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [support, setSupport] = useState<ReturnType<typeof getNotificationSupport>>('supported');

  useEffect(() => {
    setSupport(getNotificationSupport());
  }, []);

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
        {support === 'ios-not-installed' ? (
          <p className="text-neutral-600 mt-2">
            Push notifications work when Ephlats 2026 is installed on your home screen.
            You can enable them after installing — tap the gold banner on the home screen to get started.
          </p>
        ) : support === 'ios-too-old' ? (
          <p className="text-neutral-600 mt-2">
            Update to iOS 16.4 or later to receive push notifications.
          </p>
        ) : support === 'unsupported' ? (
          <p className="text-neutral-600 mt-2">
            Your browser doesn't support push notifications. Try Chrome or Safari on your phone.
          </p>
        ) : (
          <p className="text-neutral-600 mt-2">
            We'll notify you about event updates, messages, and announcements. You can change this anytime.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {support === 'supported' && (
          <Button onClick={handleEnable} loading={loading} fullWidth size="lg">
            Enable Notifications
          </Button>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} fullWidth>Back</Button>
          <Button variant="ghost" onClick={onNext} fullWidth>
            {support === 'supported' ? 'Not now' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

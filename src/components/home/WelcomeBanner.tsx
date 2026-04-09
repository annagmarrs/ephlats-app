'use client';

import { useAuth } from '@/contexts/AuthContext';

function getReunionStatus(): { text: string; emoji: string; color: string } {
  const now = new Date();
  const start = new Date('2026-04-17T00:00:00');
  const end = new Date('2026-04-19T23:59:59');

  if (now < start) {
    const diffMs = start.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      text: days === 1 ? 'Reunion starts tomorrow!' : `Reunion starts in ${days} days`,
      emoji: '🎵',
      color: 'bg-purple-light text-purple-primary',
    };
  } else if (now >= start && now <= end) {
    return {
      text: 'Reunion is happening now!',
      emoji: '🎉',
      color: 'bg-gold-light text-yellow-800',
    };
  } else {
    return {
      text: 'Thank you for an incredible reunion.',
      emoji: '💜',
      color: 'bg-purple-light text-purple-primary',
    };
  }
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const status = getReunionStatus();
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <div className={`rounded-2xl p-4 ${status.color}`}>
      <p className="font-bold text-lg">
        {status.emoji} {status.text}
      </p>
      {firstName && (
        <p className="text-sm mt-1 opacity-80">
          Welcome, {firstName}! April 17–19, 2026 · Williamstown, MA
        </p>
      )}
    </div>
  );
}

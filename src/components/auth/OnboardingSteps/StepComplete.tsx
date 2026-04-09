'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EraBadge } from '@/components/ui/Badge';
import type { Era } from '@/lib/types';

interface Props {
  name: string;
  era: Era;
  onFinish: () => Promise<void>;
}

export function StepComplete({ name, era, onFinish }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dynamically load canvas-confetti and fire it
    import('canvas-confetti').then((mod) => {
      const confetti = mod.default;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6B2D8B', '#FFCD00', '#4A1F62', '#ffffff'],
      });
    });
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    await onFinish();
  };

  const firstName = name.split(' ')[0];

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="text-6xl">🎉</div>

      <div>
        <h2 className="text-2xl font-bold text-neutral-900">You're in!</h2>
        <p className="text-xl text-neutral-700 mt-1">Welcome back, {firstName}.</p>
      </div>

      <EraBadge era={era} />

      <p className="text-neutral-600">
        We're so glad you're here. The Ephlats are back.
      </p>

      <Button onClick={handleFinish} loading={loading} fullWidth size="lg">
        Let's go
      </Button>
    </div>
  );
}

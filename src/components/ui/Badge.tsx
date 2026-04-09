import React from 'react';
import type { Era } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'gold' | 'green' | 'gray' | 'era';
  className?: string;
}

export function Badge({ children, variant = 'purple', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    purple: 'bg-purple-light text-purple-primary',
    gold: 'bg-gold-light text-yellow-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-neutral-100 text-neutral-600',
    era: 'bg-purple-primary text-white',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

const ERA_COLORS: Record<Era, string> = {
  '60s': 'bg-amber-100 text-amber-800',
  '70s': 'bg-orange-100 text-orange-800',
  '80s': 'bg-pink-100 text-pink-800',
  '90s': 'bg-purple-light text-purple-primary',
  '00s': 'bg-blue-100 text-blue-800',
  '10s': 'bg-teal-100 text-teal-800',
  '20s': 'bg-green-100 text-green-800',
};

export function EraBadge({ era }: { era: Era | string }) {
  const color = ERA_COLORS[era as Era] || 'bg-neutral-100 text-neutral-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {era} Ephlat
    </span>
  );
}

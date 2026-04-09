import React from 'react';
import Image from 'next/image';

const COLORS = [
  'bg-purple-primary',
  'bg-purple-dark',
  'bg-gold-dark',
  'bg-blue-600',
  'bg-green-600',
  'bg-red-600',
  'bg-indigo-600',
  'bg-pink-600',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { container: 'w-7 h-7 text-xs', image: 28 },
  sm: { container: 'w-9 h-9 text-sm', image: 36 },
  md: { container: 'w-11 h-11 text-base', image: 44 },
  lg: { container: 'w-16 h-16 text-xl', image: 64 },
  xl: { container: 'w-24 h-24 text-3xl', image: 96 },
};

export function Avatar({ name, photoUrl, size = 'md', className = '' }: AvatarProps) {
  const { container, image } = sizes[size];
  const color = getColorForName(name);
  const initials = getInitials(name || '?');

  if (photoUrl) {
    return (
      <div className={`${container} rounded-full overflow-hidden relative flex-shrink-0 ${className}`}>
        <Image
          src={photoUrl}
          alt={name}
          width={image}
          height={image}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white ${color} ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

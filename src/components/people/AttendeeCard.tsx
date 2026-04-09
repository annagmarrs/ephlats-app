'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { EraBadge } from '@/components/ui/Badge';
import type { Era } from '@/lib/types';

interface AttendeeItem {
  type: 'user' | 'preloaded';
  id: string;
  name: string;
  era: string;
  location: string;
  graduationYear: number;
  profilePhotoUrl: string | null;
  joined: boolean;
}

interface Props {
  item: AttendeeItem;
  viewMode: 'grid' | 'list';
  isCurrentUser: boolean;
}

export function AttendeeCard({ item, viewMode, isCurrentUser }: Props) {
  const href = item.type === 'user'
    ? (isCurrentUser ? '/profile' : `/people/${item.id}`)
    : null;

  const content = viewMode === 'grid' ? (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-colors
      ${item.joined
        ? 'bg-white border-neutral-200 hover:border-purple-primary'
        : 'bg-neutral-50 border-neutral-100 opacity-60'
      }`}
    >
      <Avatar
        name={item.name}
        photoUrl={item.joined ? item.profilePhotoUrl : null}
        size="md"
      />
      <p className="text-xs font-semibold text-neutral-900 leading-tight line-clamp-2">{item.name}</p>
      {item.graduationYear > 0 && (
        <p className="text-xs text-neutral-400">Class of {item.graduationYear}</p>
      )}
      <EraBadge era={item.era as Era} />
      {!item.joined && (
        <p className="text-xs text-neutral-400">Not on app yet</p>
      )}
      {isCurrentUser && (
        <p className="text-xs text-purple-primary font-semibold">You</p>
      )}
    </div>
  ) : (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors
      ${item.joined
        ? 'bg-white border-neutral-200 hover:border-purple-primary'
        : 'bg-neutral-50 border-neutral-100 opacity-60'
      }`}
    >
      <Avatar
        name={item.name}
        photoUrl={item.joined ? item.profilePhotoUrl : null}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-neutral-900 text-sm truncate">{item.name}</p>
          {isCurrentUser && <span className="text-xs text-purple-primary font-semibold">(You)</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <EraBadge era={item.era as Era} />
          {item.graduationYear > 0 && <span className="text-xs text-neutral-400">Class of {item.graduationYear}</span>}
          {item.location && <span className="text-xs text-neutral-500 truncate">{item.location}</span>}
          {!item.joined && <span className="text-xs text-neutral-400">Not on app yet</span>}
        </div>
      </div>
    </div>
  );

  if (!href || !item.joined) return <div>{content}</div>;
  return <Link href={href}>{content}</Link>;
}

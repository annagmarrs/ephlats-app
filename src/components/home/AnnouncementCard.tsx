'use client';

import Link from 'next/link';
import type { Announcement } from '@/lib/types';

function timeAgo(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp.toDate?.() || new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <div className="bg-gold-light border-l-4 border-gold-primary rounded-2xl overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span className="text-xl">📣</span>
        <h3 className="font-bold text-neutral-900 leading-snug flex-1 text-base">{announcement.title}</h3>
        <span className="text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">
          {timeAgo(announcement.createdAt)}
        </span>
      </div>
      <div className="px-4 pb-4">
        <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">{announcement.body}</p>
        {announcement.linkedEventId && (
          <Link
            href={`/schedule/${announcement.linkedEventId}`}
            className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-purple-primary hover:text-purple-dark min-h-[44px]"
          >
            View Event →
          </Link>
        )}
      </div>
    </div>
  );
}

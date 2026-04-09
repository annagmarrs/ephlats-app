'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
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
    <Card>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-bold text-neutral-900 leading-snug flex-1">{announcement.title}</h3>
        <span className="text-xs text-neutral-400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {timeAgo(announcement.createdAt)}
        </span>
      </div>
      <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">{announcement.body}</p>
      {announcement.linkedEventId && (
        <Link
          href={`/schedule/${announcement.linkedEventId}`}
          className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-purple-primary hover:text-purple-dark min-h-[44px]"
        >
          View Event →
        </Link>
      )}
    </Card>
  );
}

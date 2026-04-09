import React from 'react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 rounded-xl ${className}`} />;
}

export function AnnouncementSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex gap-3">
      <div className="w-1 rounded-full bg-neutral-200 self-stretch" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function PersonCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-3 flex flex-col items-center gap-2">
      <Skeleton className="w-14 h-14 rounded-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4 flex gap-3 items-center">
          <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PhotoGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-none" />
      ))}
    </div>
  );
}

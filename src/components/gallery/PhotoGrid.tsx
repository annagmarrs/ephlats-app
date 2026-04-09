'use client';

import React, { useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Photo, ScheduleEvent } from '@/lib/types';
import { QueryDocumentSnapshot } from 'firebase/firestore';

interface EventSection {
  event: ScheduleEvent;
  photos: Photo[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
  count: number;
  loading: boolean;
}

interface Props {
  section: EventSection;
  selecting: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onLoadMore: () => void;
  onOpenViewer: (photo: Photo) => void;
}

export function PhotoGrid({ section, selecting, selectedIds, onToggleSelect, onLoadMore, onOpenViewer }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!section.hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [section.hasMore, onLoadMore]);

  return (
    <div className="mb-6">
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="font-bold text-neutral-900 text-sm">{section.event.title}</h3>
        <span className="text-xs text-neutral-400">{section.count} photos</span>
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {section.photos.map((photo) => (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            selecting={selecting}
            selected={selectedIds.has(photo.id)}
            onToggleSelect={onToggleSelect}
            onOpen={onOpenViewer}
          />
        ))}
      </div>
      {section.hasMore && <div ref={sentinelRef} className="h-4" />}
      {section.loading && (
        <div className="flex justify-center py-3">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
}

const PhotoThumbnail = memo(function PhotoThumbnail({ photo, selecting, selected, onToggleSelect, onOpen }: {
  photo: Photo;
  selecting: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (photo: Photo) => void;
}) {
  return (
    <div
      className="relative aspect-square bg-neutral-100 cursor-pointer overflow-hidden"
      onClick={() => selecting ? onToggleSelect(photo.id) : onOpen(photo)}
    >
      <Image
        src={photo.thumbnailUrl || photo.photoUrl}
        alt="Gallery photo"
        fill
        className="object-cover"
        sizes="(max-width: 480px) 33vw, 160px"
        loading="lazy"
      />
      {selecting && (
        <div className={`absolute inset-0 flex items-center justify-center
          ${selected ? 'bg-purple-primary/30' : 'bg-transparent'}`}>
          <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center
            ${selected ? 'bg-purple-primary' : 'bg-transparent'}`}>
            {selected && <span className="text-white text-xs">✓</span>}
          </div>
        </div>
      )}
    </div>
  );
});

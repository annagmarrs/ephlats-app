'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function PhotoGrid({ section, selecting, selectedIds, onToggleSelect, onLoadMore, onOpenViewer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      {/* Accordion header */}
      <button
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors min-h-[56px]"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="text-left">
          <p className="font-semibold text-neutral-900 text-sm">{section.event.title}</p>
          {section.event.date && (
            <p className="text-xs text-neutral-400 mt-0.5">{formatDate(section.event.date)}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-neutral-400 font-medium">
            {section.count} photo{section.count !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Collapsible grid */}
      {open && (
        <div className="grid grid-cols-3 gap-0.5 pb-1">
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

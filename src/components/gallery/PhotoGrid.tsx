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

function AlbumCover({ photos }: { photos: Photo[] }) {
  const covers = photos.slice(0, 4);
  if (covers.length === 1) {
    return (
      <div className="relative w-full h-full">
        <Image src={covers[0].thumbnailUrl || covers[0].photoUrl} alt="" fill className="object-cover" sizes="160px" />
      </div>
    );
  }
  if (covers.length === 2 || covers.length === 3) {
    return (
      <div className="grid grid-cols-2 w-full h-full gap-0.5">
        {covers.slice(0, 2).map((p, i) => (
          <div key={i} className="relative">
            <Image src={p.thumbnailUrl || p.photoUrl} alt="" fill className="object-cover" sizes="80px" />
          </div>
        ))}
        {covers.length === 3 && (
          <div className="relative col-span-2" style={{ height: '50%', position: 'relative' }}>
            <Image src={covers[2].thumbnailUrl || covers[2].photoUrl} alt="" fill className="object-cover" sizes="160px" />
          </div>
        )}
      </div>
    );
  }
  // 4 photos — 2x2 grid
  return (
    <div className="grid grid-cols-2 w-full h-full gap-0.5">
      {covers.map((p, i) => (
        <div key={i} className="relative aspect-square">
          <Image src={p.thumbnailUrl || p.photoUrl} alt="" fill className="object-cover" sizes="80px" />
        </div>
      ))}
    </div>
  );
}

export function PhotoGrid({ section, selecting, selectedIds, onToggleSelect, onLoadMore, onOpenViewer }: Props) {
  const [open, setOpen] = useState(false);
  // Use the title stored on the photos themselves (always accurate), fall back to event title
  const albumTitle = section.photos[0]?.eventTitle || section.event.title;

  return (
    <div className="px-4 mb-4">
      {/* Album card */}
      <button
        className="w-full text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 active:opacity-80 transition-opacity">
          {/* Cover mosaic */}
          <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
            <AlbumCover photos={section.photos} />
            {/* Photo count badge */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
              <span className="text-white text-xs font-semibold">{section.count}</span>
              <span className="text-white/80 text-xs">photo{section.count !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Album footer */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900 text-sm leading-tight">{albumTitle}</p>
              {section.event.date && (
                <p className="text-xs text-neutral-400 mt-0.5">{formatDate(section.event.date)}</p>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Expanded photo grid */}
      {open && (
        <div className="mt-1 grid grid-cols-3 gap-0.5 rounded-b-xl overflow-hidden">
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

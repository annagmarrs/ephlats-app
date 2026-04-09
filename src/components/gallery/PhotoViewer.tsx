'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Trash2 } from 'lucide-react';
import { EmojiReactions } from './EmojiReactions';
import type { Photo } from '@/lib/types';

interface Props {
  photo: Photo;
  photos: Photo[];
  currentUserId: string;
  canDelete: boolean;
  onClose: () => void;
  onReact: (photoId: string, emoji: string) => void;
  onDelete: (photo: Photo) => void;
}

export function PhotoViewer({ photo: initialPhoto, photos, currentUserId, canDelete, onClose, onReact, onDelete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(photos.findIndex((p) => p.id === initialPhoto.id));
  const photo = photos[currentIdx] || initialPhoto;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIdx((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentIdx((i) => Math.min(photos.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photos.length, onClose]);

  const handleDownload = async () => {
    const res = await fetch(photo.photoUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ephlats-photo-${photo.id}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function timeAgo(ts: any): string {
    if (!ts) return '';
    const d = ts.toDate?.() || new Date(ts);
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button onClick={onClose} className="text-white min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          {canDelete && (
            <button
              onClick={() => onDelete(photo)}
              className="text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 relative flex items-center justify-center min-h-0"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 3) setCurrentIdx((i) => Math.max(0, i - 1));
          else if (x > (rect.width * 2) / 3) setCurrentIdx((i) => Math.min(photos.length - 1, i + 1));
        }}
      >
        <Image
          src={photo.photoUrl}
          alt="Photo"
          fill
          className="object-contain"
          sizes="100vw"
        />
        {/* Nav indicators */}
        {currentIdx > 0 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-2xl opacity-50 pointer-events-none">‹</div>
        )}
        {currentIdx < photos.length - 1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-2xl opacity-50 pointer-events-none">›</div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-black/80 px-4 pt-3 pb-4 flex-shrink-0 pb-[env(safe-area-inset-bottom)]">
        <EmojiReactions
          reactions={photo.reactions}
          currentUserId={currentUserId}
          onReact={(emoji) => onReact(photo.id, emoji)}
        />
        <div className="flex items-center gap-2 mt-2.5">
          <p className="text-white text-sm font-medium">{photo.uploaderName}</p>
          <span className="text-neutral-500 text-xs">· {photo.eventTitle}</span>
          <span className="text-neutral-500 text-xs ml-auto">{timeAgo(photo.uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDocs, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPhotosByEvent, togglePhotoReaction, deletePhoto } from '@/lib/firestore';
import { deleteStorageFile, getStoragePathFromUrl } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/hooks/useSchedule';
import { TopHeader } from '@/components/layout/TopHeader';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { PhotoViewer } from '@/components/gallery/PhotoViewer';
import { BulkSelectBar } from '@/components/gallery/BulkSelectBar';
import { Button } from '@/components/ui/Button';
import { Upload, CheckSquare } from 'lucide-react';
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

export default function GalleryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events } = useSchedule();
  const [sections, setSections] = useState<EventSection[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewerPhoto, setViewerPhoto] = useState<{ photo: Photo; photos: Photo[] } | null>(null);

  useEffect(() => {
    if (!events.length) return;
    const initSections = async () => {
      const newSections: (EventSection | null)[] = await Promise.all(
        events.map(async (event) => {
          try {
            const countQ = query(collection(db, 'photos'), where('eventId', '==', event.id));
            const countSnap = await getCountFromServer(countQ);
            const count = countSnap.data().count;
            if (count === 0) return null;
            const { photos, lastDoc } = await getPhotosByEvent(event.id, 30);
            return { event, photos, lastDoc, hasMore: photos.length === 30, count, loading: false };
          } catch {
            return null;
          }
        })
      );
      setSections(newSections.filter(Boolean) as EventSection[]);
    };
    initSections();
  }, [events]);

  const loadMore = async (eventId: string) => {
    setSections((prev) => prev.map((s) => s.event.id === eventId ? { ...s, loading: true } : s));
    const section = sections.find((s) => s.event.id === eventId);
    if (!section || !section.hasMore) return;
    const { photos: newPhotos, lastDoc } = await getPhotosByEvent(eventId, 30, section.lastDoc || undefined);
    setSections((prev) => prev.map((s) =>
      s.event.id === eventId
        ? { ...s, photos: [...s.photos, ...newPhotos], lastDoc, hasMore: newPhotos.length === 30, loading: false }
        : s
    ));
  };

  const handleReact = async (photoId: string, emoji: string) => {
    if (!user) return;
    const section = sections.find((s) => s.photos.some((p) => p.id === photoId));
    if (!section) return;
    const photo = section.photos.find((p) => p.id === photoId);
    if (!photo) return;
    const hasReacted = (photo.reactions[emoji] || []).includes(user.uid);
    await togglePhotoReaction(photoId, emoji, user.uid, hasReacted);
    setSections((prev) => prev.map((s) => ({
      ...s,
      photos: s.photos.map((p) => p.id !== photoId ? p : {
        ...p,
        reactions: {
          ...p.reactions,
          [emoji]: hasReacted
            ? (p.reactions[emoji] || []).filter((id) => id !== user.uid)
            : [...(p.reactions[emoji] || []), user.uid],
        },
      }),
    })));
  };

  const handleDelete = async (photo: Photo) => {
    if (!user?.isAdmin && photo.uploadedBy !== user?.uid) return;
    const path = getStoragePathFromUrl(photo.photoUrl);
    const thumbPath = getStoragePathFromUrl(photo.thumbnailUrl);
    await deletePhoto(photo.id);
    if (path) await deleteStorageFile(path).catch(() => {});
    if (thumbPath) await deleteStorageFile(thumbPath).catch(() => {});
    setSections((prev) => prev.map((s) => ({
      ...s,
      photos: s.photos.filter((p) => p.id !== photo.id),
      count: s.photos.some((p) => p.id === photo.id) ? s.count - 1 : s.count,
    })));
    setViewerPhoto(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDownload = async () => {
    const allPhotos = sections.flatMap((s) => s.photos);
    const selected = allPhotos.filter((p) => selectedIds.has(p.id));
    await Promise.all(selected.map(async (photo) => {
      const res = await fetch(photo.photoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ephlats-photo-${photo.id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }));
    setSelecting(false);
    setSelectedIds(new Set());
  };

  const allPhotos = sections.flatMap((s) => s.photos);

  return (
    <>
      <TopHeader
        title="Gallery"
        rightElement={
          <div className="flex gap-2">
            <button
              onClick={() => { setSelecting(!selecting); setSelectedIds(new Set()); }}
              className="p-2 rounded-xl hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Select photos"
            >
              <CheckSquare className="w-5 h-5 text-neutral-600" />
            </button>
            <button
              onClick={() => router.push('/gallery/upload')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold-primary text-neutral-900 rounded-xl text-sm font-semibold min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        }
      />

      <div className="pb-4">
        {sections.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 p-4">
            <p className="text-3xl mb-3">📷</p>
            <p className="font-medium">No photos yet</p>
            <p className="text-sm mt-1">Be the first to upload!</p>
            <Button onClick={() => router.push('/gallery/upload')} className="mt-4" variant="primary">
              Upload a Photo
            </Button>
          </div>
        ) : (
          sections.map((section) => (
            <PhotoGrid
              key={section.event.id}
              section={section}
              selecting={selecting}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onLoadMore={() => loadMore(section.event.id)}
              onOpenViewer={(photo) => setViewerPhoto({ photo, photos: section.photos })}
            />
          ))
        )}
      </div>

      {selecting && (
        <BulkSelectBar
          count={selectedIds.size}
          onDownload={handleBulkDownload}
          onCancel={() => { setSelecting(false); setSelectedIds(new Set()); }}
        />
      )}

      {viewerPhoto && (
        <PhotoViewer
          photo={viewerPhoto.photo}
          photos={viewerPhoto.photos}
          currentUserId={user?.uid || ''}
          canDelete={user?.isAdmin || viewerPhoto.photo.uploadedBy === user?.uid}
          onClose={() => setViewerPhoto(null)}
          onReact={handleReact}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

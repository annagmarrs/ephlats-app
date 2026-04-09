'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDocs, collection, query, orderBy, limit, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { togglePhotoReaction, deletePhoto } from '@/lib/firestore';
import { deleteStorageFile, getStoragePathFromUrl } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/hooks/useSchedule';
import { TopHeader } from '@/components/layout/TopHeader';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { PhotoViewer } from '@/components/gallery/PhotoViewer';
import { BulkSelectBar } from '@/components/gallery/BulkSelectBar';
import { Button } from '@/components/ui/Button';
import { Upload, DownloadCloud } from 'lucide-react';
import type { Photo, ScheduleEvent } from '@/lib/types';

interface EventSection {
  event: ScheduleEvent;
  photos: Photo[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
  count: number;
  loading: boolean;
}

const PAGE_SIZE = 60;

async function loadAllPhotos(lastDoc?: QueryDocumentSnapshot): Promise<{ photos: Photo[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(collection(db, 'photos'), orderBy('uploadedAt', 'desc'), limit(PAGE_SIZE));
  if (lastDoc) q = query(collection(db, 'photos'), orderBy('uploadedAt', 'desc'), limit(PAGE_SIZE), startAfter(lastDoc));
  const snap = await getDocs(q);
  const photos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Photo));
  return { photos, lastDoc: snap.docs[snap.docs.length - 1] || null };
}

export default function GalleryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events } = useSchedule();
  const [sections, setSections] = useState<EventSection[]>([]);
  const [allLastDoc, setAllLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewerPhoto, setViewerPhoto] = useState<{ photo: Photo; photos: Photo[] } | null>(null);

  useEffect(() => {
    setLoadingPhotos(true);
    loadAllPhotos().then(({ photos, lastDoc }) => {
      setAllLastDoc(lastDoc);
      setHasMore(photos.length === PAGE_SIZE);
      groupPhotos(photos, events);
      setLoadingPhotos(false);
    }).catch(() => setLoadingPhotos(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Re-group when events load (event titles become available)
  useEffect(() => {
    if (!events.length) return;
    setSections((prev) => {
      const allPhotos = prev.flatMap((s) => s.photos);
      if (!allPhotos.length) return prev;
      return buildSections(allPhotos, events);
    });
  }, [events]);

  function groupPhotos(photos: Photo[], evts: ScheduleEvent[]) {
    setSections(buildSections(photos, evts));
  }

  function buildSections(photos: Photo[], evts: ScheduleEvent[]): EventSection[] {
    const byEvent: Record<string, Photo[]> = {};
    for (const photo of photos) {
      if (!byEvent[photo.eventId]) byEvent[photo.eventId] = [];
      byEvent[photo.eventId].push(photo);
    }
    const sections: EventSection[] = [];
    for (const eventId of Object.keys(byEvent)) {
      const eventPhotos = byEvent[eventId];
      const event = evts.find((e) => e.id === eventId) || {
        id: eventId,
        title: eventPhotos[0]?.eventTitle || 'Event',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        type: 'social' as const,
        description: '',
        isConcert: false,
        order: 0,
      };
      sections.push({ event, photos: eventPhotos, lastDoc: null, hasMore: false, count: eventPhotos.length, loading: false });
    }
    return sections.sort((a, b) => a.event.date.localeCompare(b.event.date) || a.event.order - b.event.order);
  }

  const handleLoadMore = async () => {
    if (!allLastDoc) return;
    const { photos: newPhotos, lastDoc } = await loadAllPhotos(allLastDoc);
    setAllLastDoc(lastDoc);
    setHasMore(newPhotos.length === PAGE_SIZE);
    setSections((prev) => {
      const allPhotos = [...prev.flatMap((s) => s.photos), ...newPhotos];
      return buildSections(allPhotos, events);
    });
  };

  const handleReact = async (photoId: string, emoji: string) => {
    if (!user) return;
    const section = sections.find((s) => s.photos.some((p) => p.id === photoId));
    const photo = section?.photos.find((p) => p.id === photoId);
    if (!photo) return;
    const hasReacted = (photo.reactions[emoji] || []).includes(user.uid);
    const updatedReactions = {
      ...photo.reactions,
      [emoji]: hasReacted
        ? (photo.reactions[emoji] || []).filter((id) => id !== user.uid)
        : [...(photo.reactions[emoji] || []), user.uid],
    };
    const updatedPhoto = { ...photo, reactions: updatedReactions };
    // Optimistic update both sections and viewer
    setSections((prev) => prev.map((s) => ({
      ...s,
      photos: s.photos.map((p) => p.id === photoId ? updatedPhoto : p),
    })));
    setViewerPhoto((prev) => prev ? {
      ...prev,
      photo: prev.photo.id === photoId ? updatedPhoto : prev.photo,
      photos: prev.photos.map((p) => p.id === photoId ? updatedPhoto : p),
    } : null);
    await togglePhotoReaction(photoId, emoji, user.uid, hasReacted);
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
    })).filter((s) => s.photos.length > 0));
    setViewerPhoto(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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
      <TopHeader title="Gallery" />
      {/* Subheader with actions */}
      <div className="bg-purple-light border-b border-purple-primary/15 px-4 py-2 flex items-center justify-between max-w-lg mx-auto w-full">
        <button
          onClick={() => { setSelecting(!selecting); setSelectedIds(new Set()); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold min-h-[36px] transition-colors
            ${selecting ? 'bg-purple-primary text-white' : 'text-purple-dark hover:bg-purple-primary/10'}`}
          aria-label="Select to download"
        >
          <DownloadCloud className="w-4 h-4" />
          {selecting ? 'Cancel' : 'Download'}
        </button>
        <button
          onClick={() => router.push('/gallery/upload')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-primary text-neutral-900 rounded-xl text-sm font-semibold min-h-[36px]"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      <div className="pb-4">
        {loadingPhotos ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm">Loading photos…</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 p-4">
            <p className="text-3xl mb-3">📷</p>
            <p className="font-medium">No photos yet</p>
            <p className="text-sm mt-1">Be the first to upload!</p>
            <Button onClick={() => router.push('/gallery/upload')} className="mt-4" variant="primary">
              Upload a Photo
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 px-4">
              {sections.map((section) => (
                <PhotoGrid
                  key={section.event.id}
                  section={section}
                  selecting={selecting}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onLoadMore={() => {}}
                  onOpenViewer={(photo) => setViewerPhoto({ photo, photos: section.photos })}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button variant="secondary" onClick={handleLoadMore}>Load more photos</Button>
              </div>
            )}
          </>
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

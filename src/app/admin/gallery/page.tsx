'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deletePhoto } from '@/lib/firestore';
import { deleteStorageFile, getStoragePathFromUrl } from '@/lib/storage';
import { useSchedule } from '@/hooks/useSchedule';
import { Select } from '@/components/ui/Input';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Photo } from '@/lib/types';

export default function AdminGalleryPage() {
  const { events } = useSchedule();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filterEventId, setFilterEventId] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let q = filterEventId
      ? query(collection(db, 'photos'), where('eventId', '==', filterEventId), orderBy('uploadedAt', 'desc'))
      : query(collection(db, 'photos'), orderBy('uploadedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Photo)));
    });
    return () => unsub();
  }, [filterEventId]);

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Delete this photo?')) return;
    setDeleting(photo.id);
    try {
      await deletePhoto(photo.id);
      const path = getStoragePathFromUrl(photo.photoUrl);
      const thumbPath = getStoragePathFromUrl(photo.thumbnailUrl);
      if (path) await deleteStorageFile(path).catch(() => {});
      if (thumbPath) await deleteStorageFile(thumbPath).catch(() => {});
      toast.success('Photo deleted.');
    } catch {
      toast.error('Failed to delete photo.');
    } finally {
      setDeleting(null);
    }
  };

  const eventOptions = events.map((e) => ({ value: e.id, label: e.title }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Gallery ({photos.length})</h1>
        <div className="w-64">
          <Select
            options={eventOptions}
            placeholder="All events"
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group bg-neutral-100 rounded-xl overflow-hidden aspect-square">
            <Image src={photo.thumbnailUrl || photo.photoUrl} alt="Gallery" fill className="object-cover" sizes="200px" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <p className="text-white text-xs font-medium text-center px-2 truncate w-full text-center">
                {photo.uploaderName}
              </p>
              <p className="text-white/70 text-xs">{photo.eventTitle}</p>
              <button
                onClick={() => handleDelete(photo)}
                disabled={deleting === photo.id}
                className="mt-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-2xl mb-2">📷</p>
          <p>No photos yet.</p>
        </div>
      )}
    </div>
  );
}

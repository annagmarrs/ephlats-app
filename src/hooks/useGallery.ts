'use client';

import { useState, useCallback } from 'react';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { getPhotosByEvent } from '@/lib/firestore';
import type { Photo } from '@/lib/types';

export function useGallery(eventId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { photos: newPhotos, lastDoc: newLastDoc } = await getPhotosByEvent(eventId, 30, lastDoc || undefined);
    setPhotos((prev) => [...prev, ...newPhotos]);
    setLastDoc(newLastDoc);
    setHasMore(newPhotos.length === 30);
    setLoading(false);
  }, [eventId, lastDoc, loading, hasMore]);

  const reset = useCallback(() => {
    setPhotos([]);
    setLastDoc(null);
    setHasMore(true);
  }, []);

  return { photos, loading, hasMore, loadMore, reset, setPhotos };
}

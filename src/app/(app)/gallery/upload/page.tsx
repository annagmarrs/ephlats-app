'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/hooks/useSchedule';
import { uploadGalleryPhoto } from '@/lib/storage';
import { addPhoto } from '@/lib/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { TopHeader } from '@/components/layout/TopHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events } = useSchedule();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file || !eventId || !user) return;
    setUploading(true);
    try {
      const photoId = crypto.randomUUID();
      const selectedEvent = events.find((e) => e.id === eventId);
      const { photoUrl, thumbnailUrl, fileSize } = await uploadGalleryPhoto(eventId, photoId, file);
      await addPhoto({
        uploadedBy: user.uid,
        uploaderName: user.name,
        eventId,
        eventTitle: selectedEvent?.title || '',
        photoUrl,
        thumbnailUrl,
        reactions: {},
        uploadedAt: serverTimestamp() as any,
        fileSize,
      });
      toast.success('Photo uploaded!');
      router.push('/gallery');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const eventOptions = events.map((e) => ({
    value: e.id,
    label: `${e.date === '2026-04-17' ? 'Fri' : e.date === '2026-04-18' ? 'Sat' : 'Sun'} – ${e.title}`,
  }));

  return (
    <>
      <TopHeader title="Upload Photo" showBack backHref="/gallery" />
      <div className="p-4 space-y-4">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-neutral-300 rounded-2xl p-10 flex flex-col items-center gap-2 hover:border-purple-primary transition-colors min-h-[160px]"
          >
            <span className="text-4xl">📷</span>
            <span className="font-medium text-neutral-600">Choose a photo</span>
            <span className="text-sm text-neutral-400">Tap to browse your camera roll</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100">
              <Image src={preview} alt="Preview" fill className="object-contain" />
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-sm text-purple-primary min-h-[44px] px-2"
            >
              Choose a different photo
            </button>
          </div>
        )}

        <Select
          label="Tag this photo to an event"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          options={eventOptions}
          placeholder="Select an event…"
        />

        <Button
          fullWidth
          size="lg"
          loading={uploading}
          disabled={!file || !eventId}
          onClick={handleUpload}
        >
          Upload Photo
        </Button>
      </div>
    </>
  );
}

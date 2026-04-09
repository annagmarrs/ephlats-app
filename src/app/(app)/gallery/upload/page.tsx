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
import { X } from 'lucide-react';

interface FilePreview {
  file: File;
  previewUrl: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events } = useSchedule();
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [eventId, setEventId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    // reset input so same files can be re-selected
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleUpload = async () => {
    if (!previews.length || !eventId || !user) return;
    setUploading(true);
    setProgress({ done: 0, total: previews.length });
    const selectedEvent = events.find((e) => e.id === eventId);
    let successCount = 0;

    for (let i = 0; i < previews.length; i++) {
      try {
        const photoId = crypto.randomUUID();
        const { photoUrl, thumbnailUrl, fileSize } = await uploadGalleryPhoto(eventId, photoId, previews[i].file);
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
        successCount++;
        setProgress({ done: i + 1, total: previews.length });
      } catch {
        toast.error(`Failed to upload photo ${i + 1}`);
      }
    }

    setUploading(false);
    setProgress(null);
    if (successCount > 0) {
      toast.success(`${successCount} photo${successCount !== 1 ? 's' : ''} uploaded!`);
      router.push('/gallery');
    }
  };

  const eventOptions = events.map((e) => ({
    value: e.id,
    label: `${e.date === '2026-04-17' ? 'Fri' : e.date === '2026-04-18' ? 'Sat' : 'Sun'} – ${e.title}`,
  }));

  return (
    <>
      <TopHeader title="Upload Photos" showBack backHref="/gallery" />
      <div className="p-4 space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        {/* Add photos button */}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-neutral-300 rounded-2xl p-8 flex flex-col items-center gap-2 hover:border-purple-primary transition-colors min-h-[120px]"
        >
          <span className="text-3xl">📷</span>
          <span className="font-medium text-neutral-600">
            {previews.length > 0 ? 'Add more photos' : 'Choose photos'}
          </span>
          <span className="text-sm text-neutral-400">Tap to select one or more</span>
        </button>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">
              {previews.length} photo{previews.length !== 1 ? 's' : ''} selected
            </p>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((p, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                  <Image src={p.previewUrl} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                    aria-label="Remove"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Select
          label="Tag to an event"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          options={eventOptions}
          placeholder="Select an event…"
        />

        {progress && (
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div
              className="bg-purple-primary h-2 rounded-full transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        )}
        {progress && (
          <p className="text-sm text-neutral-500 text-center">
            Uploading {progress.done} of {progress.total}…
          </p>
        )}

        <Button
          fullWidth
          size="lg"
          loading={uploading}
          disabled={!previews.length || !eventId}
          onClick={handleUpload}
        >
          Upload {previews.length > 1 ? `${previews.length} Photos` : 'Photo'}
        </Button>
      </div>
    </>
  );
}

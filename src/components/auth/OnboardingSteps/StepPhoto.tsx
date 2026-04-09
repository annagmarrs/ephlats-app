'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadProfilePhoto } from '@/lib/storage';
import { Button } from '@/components/ui/Button';

interface Props {
  userId: string;
  onNext: (photoUrl: string | null) => void;
  onBack: () => void;
}

export function StepPhoto({ userId, onNext, onBack }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(userId, file);
      onNext(url);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Add a profile photo</h2>
        <p className="text-neutral-600 mt-1">Optional, but your era-mates will love seeing your face.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-primary">
            <Image src={preview} alt="Preview" width={128} height={128} className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm text-purple-primary min-h-[44px] px-2"
          >
            Choose a different photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-neutral-300 rounded-2xl p-8 flex flex-col items-center gap-2 hover:border-purple-primary transition-colors min-h-[120px]"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium text-neutral-600">Tap to choose a photo</span>
        </button>
      )}

      <div className="flex flex-col gap-3">
        {preview && (
          <Button onClick={handleUpload} loading={uploading} fullWidth>
            Upload Photo
          </Button>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} fullWidth>Back</Button>
          <Button variant="ghost" onClick={() => onNext(null)} fullWidth>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}

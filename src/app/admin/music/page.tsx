'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToMusic, addMusic, deleteMusic } from '@/lib/firestore';
import { uploadMusicPdf, deleteStorageFile, getStoragePathFromUrl } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Trash2, ExternalLink, Upload } from 'lucide-react';
import { ERA_OPTIONS } from '@/lib/types';
import type { Music } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1),
  era: z.string(),
  category: z.enum(['era-song', 'all-group']),
  order: z.coerce.number().int(),
});

type FormData = z.infer<typeof schema>;

export default function AdminMusicPage() {
  const { user } = useAuth();
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToMusic((m) => setMusicList(m));
    return () => unsub();
  }, []);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'era-song', order: musicList.length + 1, era: '90s' },
  });

  const category = watch('category');

  const onSubmit = async (data: FormData) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const pdfUrl = await uploadMusicPdf(fileName, file);
      await addMusic({
        title: data.title,
        era: data.category === 'all-group' ? null : data.era,
        category: data.category,
        pdfUrl,
        uploadedAt: serverTimestamp() as any,
        uploadedBy: user.uid,
        order: data.order,
      });
      toast.success('Sheet music uploaded!');
      reset({ category: 'era-song', order: musicList.length + 2 });
      setFile(null);
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (music: Music) => {
    if (!confirm('Delete this sheet music?')) return;
    await deleteMusic(music.id);
    const path = getStoragePathFromUrl(music.pdfUrl);
    if (path) await deleteStorageFile(path).catch(() => {});
    toast.success('Deleted.');
  };

  const eraOptions = ERA_OPTIONS.map((e) => ({ value: e, label: `${e} era` }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Sheet Music</h1>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="font-bold text-neutral-900 mb-4">Upload PDF</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Song title" error={errors.title?.message} {...register('title')} />
          <Select
            label="Category"
            options={[{ value: 'era-song', label: 'Era song' }, { value: 'all-group', label: 'All-group song' }]}
            {...register('category')}
          />
          {category === 'era-song' && (
            <Select label="Era" options={eraOptions} {...register('era')} />
          )}
          <Input label="Display order" type="number" {...register('order')} />

          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-neutral-300 rounded-xl p-4 text-sm text-neutral-500 hover:border-purple-primary transition-colors flex items-center justify-center gap-2 min-h-[56px]"
          >
            <Upload className="w-4 h-4" />
            {file ? file.name : 'Choose PDF file'}
          </button>

          <Button type="submit" loading={uploading || isSubmitting} disabled={!file} fullWidth>
            Upload Sheet Music
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">Uploaded ({musicList.length})</h2>
        </div>
        {musicList.length === 0 ? (
          <p className="text-sm text-neutral-400 p-4">No sheet music uploaded yet.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {musicList.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-neutral-400">{m.era ? `${m.era} era` : 'All-group'} · Order #{m.order}</p>
                </div>
                <a href={m.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="text-purple-primary hover:text-purple-dark min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(m)}
                  className="text-neutral-300 hover:text-error min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

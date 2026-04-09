'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useSchedule } from '@/hooks/useSchedule';
import { createAnnouncement, updateAnnouncementPushSent } from '@/lib/firestore';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Message body is required'),
  linkedEventId: z.string().optional(),
  sendPush: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const { announcements } = useAnnouncements();
  const { events } = useSchedule();

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sendPush: true },
  });

  const watchedData = watch();

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      const docRef = await createAnnouncement({
        title: data.title,
        body: data.body,
        linkedEventId: data.linkedEventId || null,
        imageUrl: null,
        createdBy: user.uid,
        sentAsPush: data.sendPush,
      });

      if (data.sendPush) {
        const res = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: data.title, body: data.body, requestingUserId: user.uid }),
        });
        const result = await res.json();
        await updateAnnouncementPushSent(docRef.id);
        toast.success(`Announcement posted! Push sent to ${result.sent || 0} devices.`);
      } else {
        toast.success('Announcement posted!');
      }
      reset({ sendPush: true });
    } catch {
      toast.error('Failed to post announcement.');
    }
  };

  const eventOptions = events.map((e) => ({ value: e.id, label: e.title }));

  function timeAgo(ts: any): string {
    if (!ts) return '';
    const d = ts.toDate?.() || new Date(ts);
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Announcements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose form */}
        <Card>
          <h2 className="font-bold text-neutral-900 mb-4">Post Announcement</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Title" placeholder="e.g. Rehearsal room change" error={errors.title?.message} {...register('title')} />
            <Textarea label="Message" rows={4} placeholder="What do you want to tell everyone?" error={errors.body?.message} {...register('body')} />
            <Select
              label="Link to event (optional)"
              options={eventOptions}
              placeholder="Select an event…"
              {...register('linkedEventId')}
            />
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input type="checkbox" className="w-4 h-4 text-purple-primary" {...register('sendPush')} />
              <span className="text-sm font-medium text-neutral-700">Send push notification</span>
            </label>

            {/* Preview */}
            {watchedData.title && (
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wide">Preview</p>
                <p className="font-semibold text-sm">{watchedData.title}</p>
                {watchedData.body && <p className="text-sm text-neutral-600 mt-1">{watchedData.body}</p>}
              </div>
            )}

            <Button type="submit" fullWidth loading={isSubmitting}>
              Post Announcement
            </Button>
          </form>
        </Card>

        {/* Past announcements */}
        <div className="space-y-3">
          <h2 className="font-bold text-neutral-900">Past Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-neutral-400">No announcements yet.</p>
          ) : (
            announcements.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-neutral-900">{a.title}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    {a.sentAsPush && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Push sent</span>
                    )}
                    <span className="text-xs text-neutral-400">{timeAgo(a.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{a.body}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

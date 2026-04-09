'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useSchedule } from '@/hooks/useSchedule';
import { createEvent, updateEvent, deleteEvent } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Edit2, Trash2, Plus } from 'lucide-react';
import type { ScheduleEvent } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  location: z.string().min(1),
  type: z.enum(['rehearsal', 'social', 'concert', 'meal', 'logistics']),
  description: z.string().optional(),
  isConcert: z.boolean(),
  order: z.coerce.number().int(),
});

type FormData = z.infer<typeof schema>;

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function AdminSchedulePage() {
  const { events } = useSchedule();
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const isEditing = editingEvent !== null;
  const modalOpen = addOpen || isEditing;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openAdd = () => {
    reset({ type: 'rehearsal', date: '2026-04-17', order: events.length + 1, isConcert: false });
    setAddOpen(true);
  };

  const openEdit = (event: ScheduleEvent) => {
    reset({ ...event, order: event.order });
    setEditingEvent(event);
  };

  const onClose = () => { setAddOpen(false); setEditingEvent(null); };

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && editingEvent) {
        await updateEvent(editingEvent.id, { ...data, description: data.description || '' });
        toast.success('Event updated!');
      } else {
        await createEvent({ ...data, description: data.description || '' });
        toast.success('Event added!');
      }
      onClose();
    } catch {
      toast.error('Failed to save event.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    setDeleting(id);
    await deleteEvent(id);
    setDeleting(null);
    toast.success('Event deleted.');
  };

  const typeOptions = [
    { value: 'rehearsal', label: 'Rehearsal' },
    { value: 'social', label: 'Social' },
    { value: 'concert', label: 'Concert' },
    { value: 'meal', label: 'Meal' },
    { value: 'logistics', label: 'Logistics' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Schedule</h1>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />Add Event</Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="px-4 py-3 font-semibold text-neutral-600">Date</th>
              <th className="px-4 py-3 font-semibold text-neutral-600">Time</th>
              <th className="px-4 py-3 font-semibold text-neutral-600">Title</th>
              <th className="px-4 py-3 font-semibold text-neutral-600">Location</th>
              <th className="px-4 py-3 font-semibold text-neutral-600">Type</th>
              <th className="px-4 py-3 font-semibold text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-600">{event.date}</td>
                <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                  {formatTime(event.startTime)}–{formatTime(event.endTime)}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">{event.title}</td>
                <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{event.location}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-full text-xs text-neutral-600 capitalize">
                    {event.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(event)} className="text-neutral-400 hover:text-purple-primary min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deleting === event.id}
                      className="text-neutral-400 hover:text-error min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={onClose} title={isEditing ? 'Edit Event' : 'Add Event'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
            <Input label="Start" type="time" error={errors.startTime?.message} {...register('startTime')} />
            <Input label="End" type="time" error={errors.endTime?.message} {...register('endTime')} />
          </div>
          <Input label="Location" error={errors.location?.message} {...register('location')} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" options={typeOptions} error={errors.type?.message} {...register('type')} />
            <Input label="Order #" type="number" error={errors.order?.message} {...register('order')} />
          </div>
          <Textarea label="Description" rows={3} {...register('description')} />
          <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
            <input type="checkbox" className="w-4 h-4" {...register('isConcert')} />
            <span className="text-sm">Is Concert (shows program + sheet music)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
            <Button type="submit" loading={isSubmitting} fullWidth>
              {isEditing ? 'Save Changes' : 'Add Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

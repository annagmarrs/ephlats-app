'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { logOut } from '@/lib/auth';
import { uploadProfilePhoto } from '@/lib/storage';
import { joinEraGroupChat, leaveEraGroupChat } from '@/lib/firestore';
import { ERA_OPTIONS, graduationYearToEra } from '@/lib/types';
import { TopHeader } from '@/components/layout/TopHeader';
import { Avatar } from '@/components/ui/Avatar';
import { EraBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { MapPin, GraduationCap, Bell, BellOff, Type } from 'lucide-react';
import type { Era } from '@/lib/types';

const schema = z.object({
  name: z.string().min(2),
  graduationYear: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().int().min(1960, 'Year must be 1960 or later').optional()
  ),
  era: z.enum(['60s', '70s', '80s', '90s', '00s', '10s', '20s', 'Current Group', 'Guest'] as const),
  location: z.string().optional().default(''),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [fontSize, setFontSize] = useState<string>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('ephlats-font-size');
    if (saved) setFontSize(saved);
  }, []);

  const applyFontSize = (key: string) => {
    const map: Record<string, string> = {
      normal: '100%', large: '112.5%', larger: '125%', largest: '137.5%',
    };
    document.documentElement.style.fontSize = map[key];
    localStorage.setItem('ephlats-font-size', key);
    setFontSize(key);
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      graduationYear: user?.graduationYear ?? undefined,
      era: user?.era || '90s',
      location: user?.location || '',
    },
  });

  if (!user) return null;

  const handleSave = async (data: FormData) => {
    const userRef = doc(db, 'users', user.uid);
    if (data.era !== user.era) {
      await leaveEraGroupChat(user.era, user.uid);
      await joinEraGroupChat(data.era, user.uid);
    }
    await updateDoc(userRef, { ...data });
    toast.success('Profile updated!');
    setEditing(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      await updateDoc(doc(db, 'users', user.uid), { profilePhotoUrl: url });
      toast.success('Photo updated!');
    } catch {
      toast.error('Photo upload failed.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const toggleNotification = async (key: 'dms' | 'groupChats') => {
    const current = user.notificationSettings[key];
    await updateDoc(doc(db, 'users', user.uid), {
      [`notificationSettings.${key}`]: !current,
    });
  };

  const handleSignOut = async () => {
    await logOut();
    router.replace('/auth');
  };

  return (
    <>
      <TopHeader title="My Profile" />
      <div className="p-4 space-y-4">
        {/* Photo + name */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <Avatar name={user.name} photoUrl={user.profilePhotoUrl} size="xl" />
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-dark transition-colors">
              <span className="text-white text-xs">📷</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoLoading} />
            </label>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
          <EraBadge era={user.era} />
        </div>

        {/* Info */}
        {!editing ? (
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            <div className="flex items-center gap-3 px-4 py-3">
              <GraduationCap className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-700">Class of {user.graduationYear}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-700">{user.location || '—'}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleSave)} className="space-y-3 bg-white rounded-2xl border border-neutral-200 p-4">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Input label="Graduation Year" type="number" error={errors.graduationYear?.message} {...register('graduationYear')} />
            <Select
              label="Era"
              options={ERA_OPTIONS.map((e) => ({ value: e, label: `${e} Ephlat` }))}
              error={errors.era?.message}
              {...register('era')}
            />
            <Input label="Location" placeholder="Boston, MA" error={errors.location?.message} {...register('location')} />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)} fullWidth>Cancel</Button>
              <Button type="submit" loading={isSubmitting} fullWidth>Save</Button>
            </div>
          </form>
        )}

        {!editing && (
          <Button variant="secondary" fullWidth onClick={() => setEditing(true)}>Edit Profile</Button>
        )}

        {/* Text Size */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
            <Type className="w-4 h-4 text-neutral-400" />
            <h2 className="font-semibold text-neutral-900 text-sm">Text Size</h2>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-end gap-2">
              {[
                { key: 'normal',  label: 'A', size: 'text-base',  title: 'Default' },
                { key: 'large',   label: 'A', size: 'text-lg',    title: 'Large' },
                { key: 'larger',  label: 'A', size: 'text-xl',    title: 'Larger' },
                { key: 'largest', label: 'A', size: 'text-2xl',   title: 'Largest' },
              ].map(({ key, label, size, title }) => (
                <button
                  key={key}
                  onClick={() => applyFontSize(key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-colors min-h-[44px]
                    ${fontSize === key
                      ? 'border-purple-primary bg-purple-primary/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  aria-label={`Set text size to ${title}`}
                  aria-pressed={fontSize === key}
                >
                  <span className={`${size} font-bold leading-none ${fontSize === key ? 'text-purple-primary' : 'text-neutral-500'}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-neutral-400">{title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900 text-sm">Notifications</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            <NotificationToggle
              label="Announcement notifications"
              enabled={true}
              locked={true}
            />
            <NotificationToggle
              label="Direct message notifications"
              enabled={user.notificationSettings.dms}
              onToggle={() => toggleNotification('dms')}
            />
            <NotificationToggle
              label="Era group chat notifications"
              enabled={user.notificationSettings.groupChats}
              onToggle={() => toggleNotification('groupChats')}
            />
          </div>
        </div>

        {/* Sign out */}
        <Button variant="destructive" fullWidth onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </>
  );
}

function NotificationToggle({ label, enabled, locked, onToggle }: {
  label: string;
  enabled: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {enabled ? (
        <Bell className="w-4 h-4 text-purple-primary flex-shrink-0" />
      ) : (
        <BellOff className="w-4 h-4 text-neutral-400 flex-shrink-0" />
      )}
      <span className="flex-1 text-sm text-neutral-700">{label}</span>
      {locked ? (
        <span className="text-xs text-neutral-400">Always on</span>
      ) : (
        <button
          onClick={onToggle}
          className={`w-11 h-6 rounded-full transition-colors relative min-h-[44px] flex items-center -mr-1
            ${enabled ? 'bg-purple-primary' : 'bg-neutral-200'}`}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
        >
          <span className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform
            ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      )}
    </div>
  );
}

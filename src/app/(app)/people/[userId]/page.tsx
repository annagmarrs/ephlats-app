'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { findOrCreateDM } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { Avatar } from '@/components/ui/Avatar';
import { EraBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { MapPin, GraduationCap } from 'lucide-react';
import type { User } from '@/lib/types';

export default function ProfileViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dmLoading, setDmLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.uid === userId) {
      router.replace('/profile');
      return;
    }
    getDoc(doc(db, 'users', userId)).then((snap) => {
      if (snap.exists()) setProfile({ ...snap.data() } as User);
      setLoading(false);
    });
  }, [userId, currentUser, router]);

  const handleMessage = async () => {
    if (!currentUser || !profile) return;
    setDmLoading(true);
    const chatId = await findOrCreateDM(currentUser.uid, profile.uid);
    setDmLoading(false);
    router.push(`/chat/${chatId}`);
  };

  if (loading) return <PageLoader />;
  if (!profile) return (
    <>
      <TopHeader title="Profile" showBack backHref="/people" />
      <div className="p-4 text-center text-neutral-400">User not found.</div>
    </>
  );

  return (
    <>
      <TopHeader title={profile.name} showBack backHref="/people" />
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <Avatar name={profile.name} photoUrl={profile.profilePhotoUrl} size="xl" />
          <h1 className="text-2xl font-bold text-neutral-900">{profile.name}</h1>
          <EraBadge era={profile.era} />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
          {profile.graduationYear > 0 && (
            <div className="flex items-center gap-3 px-4 py-3">
              <GraduationCap className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-700">Class of {profile.graduationYear}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-700">{profile.location}</span>
            </div>
          )}
        </div>

        <Button
          variant="gold"
          fullWidth
          size="lg"
          loading={dmLoading}
          onClick={handleMessage}
        >
          Send Message
        </Button>
      </div>
    </>
  );
}

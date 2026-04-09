'use client';

import { useAnnouncements } from '@/hooks/useAnnouncements';
import { TopHeader } from '@/components/layout/TopHeader';
import { AnnouncementCard } from '@/components/home/AnnouncementCard';
import { WelcomeBanner } from '@/components/home/WelcomeBanner';
import { AnnouncementSkeleton } from '@/components/ui/SkeletonLoader';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { announcements, loading } = useAnnouncements();
  const { user } = useAuth();

  return (
    <>
      <TopHeader title="Ephlats 2026" logo />
      <div className="p-4 space-y-4">
        <WelcomeBanner />

        {user?.isAdmin && (
          <a
            href="/admin/announcements"
            className="block text-center text-sm text-purple-primary font-semibold py-2 bg-purple-light rounded-xl min-h-[44px] flex items-center justify-center"
          >
            Admin Panel →
          </a>
        )}

        <h2 className="text-lg font-bold text-neutral-900">Announcements</h2>

        {loading ? (
          <div className="space-y-3">
            <AnnouncementSkeleton />
            <AnnouncementSkeleton />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10 text-neutral-400">
            <p className="text-2xl mb-2">📢</p>
            <p>No announcements yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

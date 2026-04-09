'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { InstallBanner } from '@/components/InstallBanner';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace('/auth');
    } else if (user && !user.onboarded) {
      router.replace('/auth/onboarding');
    }
  }, [loading, firebaseUser, user, router]);

  if (loading) return <PageLoader />;
  if (!firebaseUser || !user) return null;

  return (
    <div className="min-h-screen bg-neutral-100">
      <InstallBanner />
      <OfflineBanner />
      <main className="max-w-lg mx-auto pb-nav min-h-screen bg-white">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

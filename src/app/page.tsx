'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function RootPage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace('/auth');
    } else if (user && !user.onboarded) {
      router.replace('/auth/onboarding');
    } else if (user?.onboarded) {
      router.replace('/home');
    }
  }, [loading, firebaseUser, user, router]);

  return <PageLoader />;
}

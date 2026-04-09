'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace('/home');
    }
  }, [loading, user, router]);

  if (loading) return <PageLoader />;
  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}

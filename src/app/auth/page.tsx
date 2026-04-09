'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser) {
      if (user && !user.onboarded) router.replace('/auth/onboarding');
      else if (user?.onboarded) router.replace('/home');
    }
  }, [loading, firebaseUser, user, router]);

  return (
    <div className="min-h-screen bg-purple-light flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-4xl font-bold text-purple-primary">Ephlats</span>
            <span className="text-4xl font-bold text-gold-dark">2026</span>
          </div>
          <p className="text-neutral-600 text-sm">The Ephlats are back.</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-white rounded-xl p-1 mb-6 border border-neutral-200">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]
              ${mode === 'signin' ? 'bg-purple-primary text-white' : 'text-neutral-600'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]
              ${mode === 'signup' ? 'bg-purple-primary text-white' : 'text-neutral-600'}`}
          >
            Create Account
          </button>
        </div>

        {mode === 'signin' ? (
          <LoginForm onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <SignUpForm onSwitchToSignin={() => setMode('signin')} />
        )}
      </div>
    </div>
  );
}

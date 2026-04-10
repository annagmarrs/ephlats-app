'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { joinEraGroupChat } from '@/lib/firestore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StepName } from '@/components/auth/OnboardingSteps/StepName';
import { StepEra } from '@/components/auth/OnboardingSteps/StepEra';
import { StepLocation } from '@/components/auth/OnboardingSteps/StepLocation';
import { StepIdentify } from '@/components/auth/OnboardingSteps/StepIdentify';
import { StepPhoto } from '@/components/auth/OnboardingSteps/StepPhoto';
import { StepNotifications } from '@/components/auth/OnboardingSteps/StepNotifications';
import { StepComplete } from '@/components/auth/OnboardingSteps/StepComplete';
import type { Era } from '@/lib/types';

export interface OnboardingData {
  name: string;
  graduationYear: number | null;
  era: Era;
  location: string;
  profilePhotoUrl: string | null;
}

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    graduationYear: null,
    era: '90s',
    location: '',
    profilePhotoUrl: null,
  });

  useEffect(() => {
    if (!loading && !firebaseUser) router.replace('/auth');
    if (!loading && user?.onboarded) router.replace('/home');
  }, [loading, firebaseUser, user, router]);

  if (loading || !firebaseUser) return <PageLoader />;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const updateData = (partial: Partial<OnboardingData>) => setData((d) => ({ ...d, ...partial }));

  const finish = async () => {
    if (!firebaseUser) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: data.name,
      graduationYear: data.graduationYear,
      era: data.era,
      location: data.location,
      profilePhotoUrl: data.profilePhotoUrl,
      isAdmin: false,
      onboarded: true,
      fcmToken: null,
      preloadedAttendeeId: null,
      notificationSettings: { announcements: true, dms: true, groupChats: true },
      lastActiveAt: serverTimestamp(),
    }, { merge: true });
    await joinEraGroupChat(data.era, firebaseUser.uid);
    router.replace('/home');
  };

  // Progress dot indicator
  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all ${
            i + 1 === step
              ? 'w-6 h-2.5 bg-purple-primary'
              : i + 1 < step
              ? 'w-2.5 h-2.5 bg-purple-primary opacity-50'
              : 'w-2.5 h-2.5 bg-neutral-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full px-5">
        {step <= TOTAL_STEPS && <ProgressDots />}

        <div className="flex-1 flex flex-col">
          {step === 1 && (
            <StepName
              initialName={data.name}
              onNext={(name) => { updateData({ name }); next(); }}
            />
          )}
          {step === 2 && (
            <StepEra
              initialYear={data.graduationYear}
              initialEra={data.era}
              onNext={(graduationYear, era) => { updateData({ graduationYear, era }); next(); }}
              onBack={back}
            />
          )}
          {step === 3 && (
            <StepLocation
              initialLocation={data.location}
              onNext={(location) => { updateData({ location }); next(); }}
              onBack={back}
            />
          )}
          {step === 4 && (
            <StepIdentify
              name={data.name}
              graduationYear={data.graduationYear}
              userId={firebaseUser.uid}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 5 && (
            <StepPhoto
              userId={firebaseUser.uid}
              onNext={(photoUrl) => { updateData({ profilePhotoUrl: photoUrl }); next(); }}
              onBack={back}
            />
          )}
          {step === 6 && (
            <StepNotifications
              userId={firebaseUser.uid}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 7 && (
            <StepComplete
              name={data.name}
              era={data.era}
              onFinish={finish}
            />
          )}
        </div>
      </div>
    </div>
  );
}

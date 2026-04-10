'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { signInWithEmail, signInWithGoogle, resetPassword, getAuthErrorMessage } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signInWithEmail(data.email, data.password);
      router.replace('/home');
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err.code));
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      // result is null when redirect is used (PWA mode) — navigation handled by AuthContext
      if (result) router.replace('/home');
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err.code));
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues('email');
    if (!email) {
      toast.error('Enter your email address first.');
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
      toast.success('Password reset email sent!');
    } catch {
      toast.error('Could not send reset email. Check the address and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="text-right">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-purple-primary hover:text-purple-dark min-h-[44px] px-1"
        >
          {resetSent ? 'Email sent! Check your inbox.' : 'Forgot password?'}
        </button>
      </div>

      <Button type="submit" fullWidth loading={isSubmitting}>
        Sign In
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-neutral-200" />
        <span className="text-xs text-neutral-400 font-medium">or</span>
        <div className="flex-1 border-t border-neutral-200" />
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={googleLoading}
        onClick={handleGoogle}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </Button>
    </form>
  );
}

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]';

  const variants: Record<string, string> = {
    primary: 'bg-purple-primary text-white hover:bg-purple-dark focus:ring-purple-primary',
    secondary: 'border border-purple-primary text-purple-primary bg-white hover:bg-purple-light focus:ring-purple-primary',
    gold: 'bg-gold-primary text-neutral-900 hover:bg-gold-dark focus:ring-gold-primary',
    ghost: 'text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-300',
    destructive: 'border border-error text-error bg-white hover:bg-red-50 focus:ring-error',
  };

  const sizes: Record<string, string> = {
    sm: 'text-sm px-3 py-2 min-h-[36px]',
    md: 'text-base px-5 py-3 h-12',
    lg: 'text-lg px-6 py-4',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

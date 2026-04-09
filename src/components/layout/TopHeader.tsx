'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: React.ReactNode;
  logo?: boolean;
}

export function TopHeader({ title, showBack = false, backHref, rightElement, logo = false }: TopHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-2">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>
        )}

        {logo ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: '#6B2D8B' }}>Ephlats</span>
              <span className="text-xl font-bold" style={{ color: '#FFCD00' }}>2026</span>
            </div>
          </div>
        ) : (
          <h1 className="flex-1 text-lg font-bold text-neutral-900 truncate text-center">{title}</h1>
        )}

        {rightElement ? (
          <div className="flex items-center">{rightElement}</div>
        ) : (
          <div className="w-11" />
        )}
      </div>
    </header>
  );
}

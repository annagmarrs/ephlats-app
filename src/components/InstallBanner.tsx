'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type BannerType = 'ios-safari' | 'ios-other' | 'android' | 'desktop' | 'none';

export function InstallBanner() {
  const [bannerType, setBannerType] = useState<BannerType>('none');
  const [dismissed, setDismissed] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    const isInstalled =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    if (isInstalled) return;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isIOSSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    const isIOSNonSafari = isIOS && !isIOSSafari;
    const isAndroid = /Android/.test(ua);
    const isDesktop = !isIOS && !isAndroid;

    // Desktop: persist dismissal
    if (isDesktop && localStorage.getItem('install-banner-dismissed')) return;

    if (isIOSSafari) setBannerType('ios-safari');
    else if (isIOSNonSafari) setBannerType('ios-other');
    else if (isAndroid) setBannerType('android');
    else if (isDesktop) setBannerType('desktop');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
    });
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (bannerType === 'desktop') localStorage.setItem('install-banner-dismissed', '1');
  };

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === 'accepted') setDismissed(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin).then(() => {
      alert('Link copied! Open it in Safari.');
    });
  };

  if (bannerType === 'none' || dismissed) return null;

  if (bannerType === 'desktop') {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-neutral-100 border-b border-neutral-200 px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <p className="text-sm text-neutral-600 flex-1">
            Ephlats 2026 is designed for mobile — open <span className="font-semibold">{typeof window !== 'undefined' ? window.location.origin : ''}</span> on your phone for the best experience.
          </p>
          <button onClick={handleDismiss} className="min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Dismiss">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 bg-gold-primary text-neutral-900 px-4 py-3">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {bannerType === 'ios-safari' && (
              <>
                <p className="text-sm font-semibold">Add to your home screen for the best experience</p>
                <p className="text-xs mt-0.5 flex items-center gap-1">
                  Tap
                  <svg className="w-4 h-4 inline mx-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 12H16M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" strokeLinecap="round"/>
                    <path d="M12 3L9 6M12 3L15 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  then "Add to Home Screen"
                </p>
              </>
            )}
            {bannerType === 'ios-other' && (
              <>
                <p className="text-sm font-semibold">To install on your iPhone, open this link in Safari</p>
                <button onClick={handleCopyLink} className="text-xs font-semibold underline mt-0.5 min-h-[44px] pr-2">
                  Copy Link
                </button>
                <p className="text-xs text-neutral-700 mt-0.5">The app still works fully in your current browser.</p>
              </>
            )}
            {bannerType === 'android' && (
              <>
                <p className="text-sm font-semibold">Add Ephlats 2026 to your home screen</p>
                {deferredPromptRef.current ? (
                  <button onClick={handleInstall} className="text-xs font-bold underline mt-0.5 min-h-[44px] pr-2">
                    Install
                  </button>
                ) : (
                  <p className="text-xs mt-0.5">Tap your browser menu (⋮) → "Add to Home Screen"</p>
                )}
              </>
            )}
          </div>
          <button onClick={handleDismiss} className="min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0" aria-label="Dismiss banner">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

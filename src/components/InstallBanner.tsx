'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type BannerType = 'ios-safari' | 'ios-other' | 'android' | 'desktop' | 'none';

// iOS Share button icon (matches what appears in Safari)
function ShareIcon() {
  return (
    <svg className="inline w-5 h-5 mx-0.5 align-text-bottom flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13" />
      <path d="M8 7l4-4 4 4" />
      <path d="M20 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5" />
    </svg>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-900/15 text-neutral-900 text-[11px] font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-sm leading-snug">{children}</span>
    </div>
  );
}

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
      alert('Link copied! Paste it into Safari to continue.');
    });
  };

  if (bannerType === 'none' || dismissed) return null;

  if (bannerType === 'desktop') {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-neutral-100 border-b border-neutral-200 px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <p className="text-sm text-neutral-600 flex-1">
            Ephlats 2026 is designed for mobile — open{' '}
            <span className="font-semibold">{typeof window !== 'undefined' ? window.location.origin : ''}</span>{' '}
            on your phone for the full app experience.
          </p>
          <button onClick={handleDismiss} className="min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Dismiss">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 bg-gold-primary text-neutral-900 px-4 pt-3 pb-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-2.5">

            {bannerType === 'ios-safari' && (
              <>
                <p className="font-bold text-base leading-snug">
                  Add Ephlats 2026 to your home screen
                </p>
                <p className="text-sm text-neutral-700">
                  This helps you access the app more easily during reunion weekend.
                </p>
                <div className="space-y-2 pt-0.5">
                  <Step n={1}>
                    Tap the <ShareIcon /> <strong>Share button</strong> at the bottom of your screen (the box with an arrow pointing up).
                  </Step>
                  <Step n={2}>
                    Scroll down in the menu that appears and tap <strong>"Add to Home Screen."</strong>
                  </Step>
                  <Step n={3}>
                    Tap <strong>"Add"</strong> in the top-right corner.
                  </Step>
                  <Step n={4}>
                    Find the <strong>Ephlats 2026</strong> icon on your home screen and tap it to open the app!
                  </Step>
                </div>
              </>
            )}

            {bannerType === 'ios-other' && (
              <>
                <p className="font-bold text-base leading-snug">
                  Open this in Safari to install the app
                </p>
                <p className="text-sm text-neutral-700">
                  Adding to your home screen only works from Safari. Here's how:
                </p>
                <div className="space-y-2 pt-0.5">
                  <Step n={1}>
                    Tap <strong>"Copy Link"</strong> below to copy the app address.
                  </Step>
                  <Step n={2}>
                    Open the <strong>Safari</strong> app on your phone (it looks like a compass).
                  </Step>
                  <Step n={3}>
                    Paste the link into Safari's address bar at the top and go.
                  </Step>
                  <Step n={4}>
                    Once in Safari, tap the <ShareIcon /> <strong>Share button</strong> at the bottom, then <strong>"Add to Home Screen."</strong>
                  </Step>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="mt-1 px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-xl min-h-[44px]"
                >
                  Copy Link
                </button>
              </>
            )}

            {bannerType === 'android' && (
              <>
                <p className="font-bold text-base leading-snug">
                  Add Ephlats 2026 to your home screen
                </p>
                <p className="text-sm text-neutral-700">
                  This helps you access the app more easily during reunion weekend.
                </p>
                {deferredPromptRef.current ? (
                  <>
                    <div className="space-y-2 pt-0.5">
                      <Step n={1}>Tap <strong>"Install"</strong> below.</Step>
                      <Step n={2}>Tap <strong>"Install"</strong> again in the pop-up to confirm.</Step>
                      <Step n={3}>Find the <strong>Ephlats 2026</strong> icon on your home screen and tap it!</Step>
                    </div>
                    <button
                      onClick={handleInstall}
                      className="mt-1 px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-xl min-h-[44px]"
                    >
                      Install App
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 pt-0.5">
                    <Step n={1}>
                      Tap the <strong>three dots (⋮)</strong> in the top-right corner of your browser.
                    </Step>
                    <Step n={2}>
                      Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App."</strong>
                    </Step>
                    <Step n={3}>
                      Tap <strong>"Add"</strong> or <strong>"Install"</strong> to confirm.
                    </Step>
                    <Step n={4}>
                      Find the <strong>Ephlats 2026</strong> icon on your home screen and tap it!
                    </Step>
                  </div>
                )}
              </>
            )}

          </div>

          <button
            onClick={handleDismiss}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0 -mr-1"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

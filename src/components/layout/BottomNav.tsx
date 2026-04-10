'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Image, Users, MessageCircle } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/gallery', label: 'Gallery', icon: Image },
  { href: '/people', label: 'People', icon: Users },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
];

export function BottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setHidden(window.innerHeight - vv.height > 100);
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);

  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 z-40 bg-purple-dark pb-[env(safe-area-inset-bottom)]"
      style={{ left: 0, right: 0, maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[64px]
                ${active ? 'text-gold-primary' : 'text-white/50 hover:text-white/80'}`}
              aria-label={label}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

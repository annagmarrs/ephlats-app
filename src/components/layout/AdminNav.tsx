'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/schedule', label: 'Schedule' },
  { href: '/admin/concert', label: 'Concert' },
  { href: '/admin/attendees', label: 'Attendees' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/music', label: 'Music' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-purple-dark text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto">
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-purple-200 hover:text-white text-sm font-medium mr-3 whitespace-nowrap min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4" />
          App
        </Link>
        <span className="text-sm font-bold text-gold-primary mr-4 whitespace-nowrap">Admin</span>
        {ADMIN_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] flex items-center
                ${active ? 'bg-white text-purple-dark' : 'text-purple-100 hover:bg-purple-primary'}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar } from '@/components/ui/Avatar';
import { EraBadge } from '@/components/ui/Badge';
import type { Chat, User } from '@/lib/types';

interface Props {
  chat: Chat;
  currentUserId: string;
}

export function ChatListItem({ chat, currentUserId }: Props) {
  const [otherUser, setOtherUser] = useState<User | null>(null);

  useEffect(() => {
    if (chat.type === 'dm') {
      const otherId = chat.participants.find((id) => id !== currentUserId);
      if (otherId) {
        getDoc(doc(db, 'users', otherId)).then((snap) => {
          if (snap.exists()) setOtherUser({ ...snap.data() } as User);
        });
      }
    }
  }, [chat, currentUserId]);

  const displayName = chat.type === 'group'
    ? (chat.name || `${chat.eraGroup} Ephlats`)
    : (otherUser?.name || 'Loading…');

  const photoUrl = chat.type === 'dm' ? otherUser?.profilePhotoUrl : null;

  function timeAgo(ts: any): string {
    if (!ts) return '';
    const d = ts.toDate?.() || new Date(ts);
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return 'now';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  }

  return (
    <Link
      href={`/chat/${chat.id}`}
      className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-200 hover:border-purple-primary transition-colors min-h-[64px]"
    >
      <div className="relative flex-shrink-0">
        <Avatar name={displayName} photoUrl={photoUrl} size="md" />
        {chat.type === 'group' && (
          <span className="absolute -bottom-1 -right-1 text-xs bg-purple-primary text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
            G
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 justify-between">
          <p className="font-semibold text-neutral-900 text-sm truncate">{displayName}</p>
          {chat.lastMessageAt && (
            <span className="text-xs text-neutral-400 flex-shrink-0">{timeAgo(chat.lastMessageAt)}</span>
          )}
        </div>
        {chat.lastMessage && (
          <p className="text-sm text-neutral-500 truncate mt-0.5">{chat.lastMessage}</p>
        )}
      </div>
    </Link>
  );
}

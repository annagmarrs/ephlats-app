'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/hooks/useChat';
import { findOrCreateDM, subscribeToUsers } from '@/lib/firestore';
import { TopHeader } from '@/components/layout/TopHeader';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { ChatListSkeleton } from '@/components/ui/SkeletonLoader';
import { Plus } from 'lucide-react';
import type { Chat, User } from '@/lib/types';
import { useEffect } from 'react';

export default function ChatPage() {
  const { user } = useAuth();
  const { chats, loading } = useChats(user?.uid);
  const router = useRouter();
  const [newDmOpen, setNewDmOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dmLoading, setDmLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToUsers((u) => setAllUsers(u));
    return () => unsub();
  }, []);

  const eraChat = chats.find((c) => c.type === 'group' && c.eraGroup === user?.era);
  const dmChats = chats.filter((c) => c.type === 'dm');

  const filteredUsers = allUsers.filter(
    (u) => u.uid !== user?.uid && u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartDM = async (targetUser: User) => {
    if (!user) return;
    setDmLoading(targetUser.uid);
    const chatId = await findOrCreateDM(user.uid, targetUser.uid);
    setDmLoading(null);
    setNewDmOpen(false);
    router.push(`/chat/${chatId}`);
  };

  const getUnreadCount = (chat: Chat) => {
    return 0; // Simplified — actual unread count would require message queries
  };

  return (
    <>
      <TopHeader
        title="Messages"
        rightElement={
          <button
            onClick={() => setNewDmOpen(true)}
            className="p-2 rounded-xl hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="New message"
          >
            <Plus className="w-5 h-5 text-neutral-600" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {loading ? (
          <ChatListSkeleton />
        ) : (
          <>
            {/* Era group chat */}
            {eraChat && (
              <div>
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Your Era Chat</h2>
                <ChatListItem chat={eraChat} currentUserId={user?.uid || ''} />
              </div>
            )}

            {/* DMs */}
            <div>
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Direct Messages</h2>
              {dmChats.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-sm">No messages yet.</p>
                  <button
                    onClick={() => setNewDmOpen(true)}
                    className="mt-2 text-sm text-purple-primary font-semibold min-h-[44px] px-2"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {dmChats.map((chat) => (
                    <ChatListItem key={chat.id} chat={chat} currentUserId={user?.uid || ''} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal open={newDmOpen} onClose={() => setNewDmOpen(false)} title="New Message">
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
          {filteredUsers.map((u) => (
            <button
              key={u.uid}
              onClick={() => handleStartDM(u)}
              disabled={dmLoading === u.uid}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors min-h-[56px] text-left"
            >
              <Avatar name={u.name} photoUrl={u.profilePhotoUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 text-sm">{u.name}</p>
                <p className="text-xs text-neutral-400">{u.era} era</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendMessage, markMessagesRead } from '@/lib/firestore';
import { useMessages } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Send } from 'lucide-react';
import type { Chat } from '@/lib/types';

export default function ChatThreadPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const { messages, loading } = useMessages(chatId);
  const [chat, setChat] = useState<Chat | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getDoc(doc(db, 'chats', chatId)).then((snap) => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() } as Chat);
    });
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user || !messages.length) return;
    markMessagesRead(chatId, messages, user.uid).catch(() => {});
  }, [messages, chatId, user]);

  // Handle keyboard appearance on iOS
  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      await sendMessage(chatId, {
        senderId: user.uid,
        senderName: user.name,
        senderPhotoUrl: user.profilePhotoUrl,
        text: msgText,
        sentAt: serverTimestamp() as any,
        readBy: [user.uid],
      });
      // Notify other participants
      await fetch('/api/chat-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, senderId: user.uid, text: msgText }),
      }).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  const chatName = chat?.type === 'group'
    ? (chat.name || `${chat.eraGroup} Ephlats`)
    : 'Chat';

  return (
    <div className="flex flex-col h-screen">
      <TopHeader title={chatName} showBack backHref="/chat" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0">
        {loading ? (
          <PageLoader />
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-neutral-400">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === user?.uid}
              showSender={chat?.type === 'group'}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-neutral-200 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary min-h-[44px] max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-11 h-11 bg-purple-primary rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

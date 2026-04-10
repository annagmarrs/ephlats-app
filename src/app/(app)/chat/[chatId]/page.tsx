'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendMessage, markMessagesRead } from '@/lib/firestore';
import { useMessages } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ChevronLeft, Send } from 'lucide-react';
import type { Chat } from '@/lib/types';

export default function ChatThreadPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, loading } = useMessages(chatId);
  const [chat, setChat] = useState<Chat | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  // Track the visual viewport so the container stays above the keyboard
  const [vpTop, setVpTop] = useState(0);
  const [vpHeight, setVpHeight] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) {
      setVpTop(0);
      setVpHeight(window.innerHeight);
      return;
    }
    const update = () => {
      setVpTop(vv.offsetTop);
      setVpHeight(vv.height);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

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

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const msgText = text.trim();
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    /*
     * Fixed container sized to the visual viewport (not layout viewport).
     * - top/height track visualViewport.offsetTop + visualViewport.height so
     *   it shifts up exactly when the iOS keyboard appears.
     * - NO overflow-hidden — that clips sticky children on iOS Safari.
     * - z-50 covers the BottomNav (z-40).
     */
    <div
      className="fixed inset-x-0 z-50 flex flex-col bg-white"
      style={{
        top: vpTop,
        height: vpHeight ?? '100dvh',
      }}
    >
      {/* ── Header ── inlined to avoid TopHeader's sticky, which misbehaves
           inside a fixed container on iOS Safari */}
      <div className="flex-shrink-0 bg-purple-light border-b border-purple-primary/15 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center h-14 px-2 gap-1 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/chat')}
            className="p-2 rounded-xl hover:bg-purple-primary/10 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 text-purple-dark" />
          </button>
          <h1 className="flex-1 text-center font-bold text-purple-dark text-lg truncate px-1">
            {chatName}
          </h1>
          {/* Balancing spacer so title is truly centered */}
          <div className="w-11 flex-shrink-0" />
        </div>
      </div>

      {/* ── Messages ── flex-1 + min-h-0 is required so this area can shrink
           below its content height and not overflow the container */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-1 bg-neutral-50">
        {loading ? (
          <PageLoader />
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isFirst = i === 0 || messages[i - 1].senderId !== msg.senderId;
              const isLast = i === messages.length - 1 || messages[i + 1].senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === user?.uid}
                  showSender={chat?.type === 'group'}
                  isFirst={isFirst}
                  isLast={isLast}
                />
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ── Input bar ── flex-shrink-0 keeps it pinned to bottom of container.
           env(safe-area-inset-bottom) adds iPhone home-indicator clearance.
           When keyboard is open, visualViewport shrinks the container so this
           bar naturally sits just above the keyboard — no extra positioning needed. */}
      <div
        className="flex-shrink-0 bg-white border-t border-neutral-200"
        style={{ padding: '6px 12px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-2 w-full">
          {/* min-w-0 prevents the textarea from overflowing its flex container */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onFocus={() => {
              setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 350);
            }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 min-w-0 resize-none border border-neutral-300 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary min-h-[40px] max-h-24 bg-white"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 w-10 h-10 bg-purple-primary rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

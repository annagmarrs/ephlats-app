'use client';

import { useState, useEffect } from 'react';
import { subscribeToUserChats, subscribeToMessages } from '@/lib/firestore';
import type { Chat, Message } from '@/lib/types';

export function useChats(userId: string | undefined) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const unsub = subscribeToUserChats(userId, (c) => {
      setChats(c);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { chats, loading };
}

export function useMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) { setLoading(false); return; }
    const unsub = subscribeToMessages(chatId, (m) => {
      setMessages(m);
      setLoading(false);
    });
    return () => unsub();
  }, [chatId]);

  return { messages, loading };
}

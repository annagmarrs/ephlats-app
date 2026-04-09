import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminMessaging } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { chatId, senderId, text } = await req.json();
    const adminDb = getAdminDb();
    const adminMessaging = getAdminMessaging();

    const chatSnap = await adminDb.collection('chats').doc(chatId).get();
    if (!chatSnap.exists) return NextResponse.json({ success: false });

    const chatData = chatSnap.data()!;
    const participants: string[] = chatData.participants || [];
    const chatType: string = chatData.type;
    const chatName: string = chatData.name || `${chatData.eraGroup} Ephlats`;

    const senderSnap = await adminDb.collection('users').doc(senderId).get();
    const senderName = senderSnap.data()?.name || 'Someone';

    const recipients = participants.filter((id) => id !== senderId);

    const tokens: string[] = [];
    for (const recipientId of recipients) {
      const userSnap = await adminDb.collection('users').doc(recipientId).get();
      const userData = userSnap.data();
      if (!userData) continue;
      const token = userData.fcmToken;
      if (!token) continue;

      const notificationSettings = userData.notificationSettings || {};
      if (chatType === 'dm' && !notificationSettings.dms) continue;
      if (chatType === 'group' && !notificationSettings.groupChats) continue;

      tokens.push(token);
    }

    if (tokens.length === 0) return NextResponse.json({ success: true, sent: 0 });

    const title = chatType === 'dm' ? senderName : `${chatName}`;
    const body = chatType === 'dm' ? text.slice(0, 100) : `${senderName}: ${text.slice(0, 80)}`;

    await adminMessaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        notification: { icon: '/icons/icon-192x192.png' },
        fcmOptions: { link: `/chat/${chatId}` },
      },
    });

    return NextResponse.json({ success: true, sent: tokens.length });
  } catch (err) {
    console.error('Chat notify error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

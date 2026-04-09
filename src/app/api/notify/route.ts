import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminMessaging } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
import { truncateNotificationBody } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { title, body, requestingUserId } = await req.json();

    const adminDb = getAdminDb();
    const adminMessaging = getAdminMessaging();

    // Verify admin
    if (!requestingUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userSnap = await adminDb.collection('users').doc(requestingUserId).get();
    if (!userSnap.exists || !userSnap.data()?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Gather all FCM tokens
    const usersSnap = await adminDb.collection('users').get();
    const tokens: string[] = [];
    usersSnap.forEach((doc) => {
      const token = doc.data().fcmToken;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No tokens' });
    }

    // Batch in groups of 500
    const BATCH_SIZE = 500;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);
      const response = await adminMessaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title,
          body: truncateNotificationBody(body),
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
          },
          fcmOptions: { link: '/home' },
        },
      });
      successCount += response.successCount;
      failCount += response.failureCount;
    }

    return NextResponse.json({ success: true, sent: successCount, failed: failCount });
  } catch (err) {
    console.error('Notification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessagingInstance } from './firebase';
import { db } from './firebase';

export async function requestNotificationPermission(userId: string): Promise<boolean> {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
    });

    if (token) {
      await updateDoc(doc(db, 'users', userId), { fcmToken: token });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error getting FCM token:', err);
    return false;
  }
}

export function truncateNotificationBody(body: string, maxLength = 100): string {
  if (body.length <= maxLength) return body;
  const truncated = body.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

export function isIOSVersionTooOld(): boolean {
  if (typeof navigator === 'undefined') return false;
  const match = navigator.userAgent.match(/OS (\d+)_/);
  if (!match) return false;
  const version = parseInt(match[1], 10);
  return version < 16;
}

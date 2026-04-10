import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { preloadedId, userId } = await req.json();
    if (!preloadedId || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const adminDb = getAdminDb();

    // Verify the attendee record exists and hasn't already been claimed
    const attendeeRef = adminDb.collection('preloadedAttendees').doc(preloadedId);
    const attendeeSnap = await attendeeRef.get();
    if (!attendeeSnap.exists) {
      return NextResponse.json({ error: 'Attendee not found' }, { status: 404 });
    }
    if (attendeeSnap.data()?.matched === true) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
    }

    const batch = adminDb.batch();
    batch.update(attendeeRef, { matched: true, userId });
    batch.set(adminDb.collection('users').doc(userId), { preloadedAttendeeId: preloadedId }, { merge: true });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('claim-attendee error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

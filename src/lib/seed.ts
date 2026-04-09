/**
 * Seed script — run with: npm run seed
 * Seeds schedule events and era group chats into Firestore.
 * Safe to run multiple times (checks for existing data before writing).
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = admin.firestore();

const scheduleData = [
  {
    title: 'Check-in & Reunion Packet Pick-up',
    description: "Start your weekend here — check in, pick up your reunion packet, and say hello! Note: If you are arriving after Friday's check-in, registration will also be set up at Paresky Auditorium on Saturday during lunch and outside Brooks-Rogers before the concert.",
    date: '2026-04-17',
    startTime: '17:00',
    endTime: '20:00',
    location: 'Williams College Faculty Club — 968 Main St',
    type: 'logistics',
    isConcert: false,
    order: 1,
  },
  {
    title: 'Reunion Weekend Welcome Dinner',
    description: 'Join us for welcome drinks, a buffet dinner, and a short performance from the current Ephlats group. Appetizers 6–7pm, buffet dinner 7–9pm. Following dinner, the festivities continue at the Log (cash bar) for late-night socializing and impromptu singing.',
    date: '2026-04-17',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Williams College Faculty Club — 968 Main St',
    type: 'social',
    isConcert: false,
    order: 2,
  },
  {
    title: 'Era Rehearsals',
    description: 'Rehearsals run 10am–12pm in Griffin Hall and the Wachenheim Science Building (NSB).\n\nRoom assignments:\n• 1960s — Griffin 4\n• 1970s — Griffin 5\n• 1980s — Griffin 6\n• 1990s — Wachenheim 015 & 017\n• 2000s — Wachenheim 113\n• 2010s — Wachenheim 114\n• 2020s — Wachenheim 116\n\nRefer to the campus map in your reunion packet to navigate.',
    date: '2026-04-18',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Griffin Hall & Wachenheim Science Building',
    type: 'rehearsal',
    isConcert: false,
    order: 3,
  },
  {
    title: 'All-Era Rehearsal & Grab-and-Go Lunch',
    description: 'Gather for lunch and an all-era rehearsal. Sheet music will be provided in your reunion packet.',
    date: '2026-04-18',
    startTime: '12:30',
    endTime: '14:30',
    location: 'Paresky Auditorium — Basement Level of Paresky Center, 39 Chapin Hall Dr',
    type: 'rehearsal',
    isConcert: false,
    order: 4,
  },
  {
    title: 'Era Rehearsals (Afternoon)',
    description: 'Second rehearsal block. Same room assignments as the morning session.\n\nRoom assignments:\n• 1960s — Griffin 4\n• 1970s — Griffin 5\n• 1980s — Griffin 6\n• 1990s — Wachenheim 015 & 017\n• 2000s — Wachenheim 113\n• 2010s — Wachenheim 114\n• 2020s — Wachenheim 116',
    date: '2026-04-18',
    startTime: '15:00',
    endTime: '17:00',
    location: 'Griffin Hall & Wachenheim Science Building',
    type: 'rehearsal',
    isConcert: false,
    order: 5,
  },
  {
    title: 'Ephlats 70th Reunion Concert',
    description: 'The main event. Featuring performances from the 60s through the current group. Please arrive at 6:30pm for seating.',
    date: '2026-04-18',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Brooks-Rogers Recital Hall — Bernhard Music Center, 54 Chapin Hall Drive',
    type: 'concert',
    isConcert: true,
    order: 6,
  },
  {
    title: 'After Show Party',
    description: 'Immediately following the concert — keep the reunion going with late-night snacks, sips, and plenty of singing.',
    date: '2026-04-18',
    startTime: '21:00',
    endTime: '01:00',
    location: 'The Log — 78 Spring St',
    type: 'social',
    isConcert: false,
    order: 7,
  },
  {
    title: 'Farewell Breakfast',
    description: 'A relaxed send-off with a light breakfast and good company.',
    date: '2026-04-19',
    startTime: '09:00',
    endTime: '11:30',
    location: 'Griffin 3 — Griffin Hall, 844 Main St',
    type: 'meal',
    isConcert: false,
    order: 8,
  },
];

const eraGroupChats = [
  { era: '60s', name: '60s Ephlats' },
  { era: '70s', name: '70s Ephlats' },
  { era: '80s', name: '80s Ephlats' },
  { era: '90s', name: '90s Ephlats' },
  { era: '00s', name: '00s Ephlats' },
  { era: '10s', name: '10s Ephlats' },
  { era: '20s', name: '20s Ephlats' },
];

async function seedSchedule() {
  const existing = await db.collection('events').limit(1).get();
  if (!existing.empty) {
    console.log('Schedule already seeded — skipping.');
    return;
  }

  const batch = db.batch();
  for (const event of scheduleData) {
    const ref = db.collection('events').doc();
    batch.set(ref, event);
  }
  await batch.commit();
  console.log(`✓ Seeded ${scheduleData.length} schedule events.`);
}

async function seedEraChats() {
  for (const chat of eraGroupChats) {
    const existing = await db
      .collection('chats')
      .where('type', '==', 'group')
      .where('eraGroup', '==', chat.era)
      .limit(1)
      .get();

    if (!existing.empty) {
      console.log(`Era chat ${chat.era} already exists — skipping.`);
      continue;
    }

    await db.collection('chats').add({
      type: 'group',
      participants: [],
      eraGroup: chat.era,
      name: chat.name,
      lastMessage: null,
      lastMessageAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✓ Created ${chat.name} group chat.`);
  }
}

async function main() {
  console.log('Starting seed...');
  await seedSchedule();
  await seedEraChats();
  console.log('Seed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

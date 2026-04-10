import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Announcement, ScheduleEvent, Chat, Message, Photo, User, PreloadedAttendee, ConcertProgramEntry, Music } from './types';

// ─── Announcements ──────────────────────────────────────────────────────────

export function subscribeToAnnouncements(callback: (items: Announcement[]) => void) {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
  });
}

export async function createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'pushSentAt'>) {
  return addDoc(collection(db, 'announcements'), { ...data, createdAt: serverTimestamp(), pushSentAt: null });
}

export async function updateAnnouncementPushSent(id: string) {
  await updateDoc(doc(db, 'announcements', id), { sentAsPush: true, pushSentAt: serverTimestamp() });
}

// ─── Schedule ───────────────────────────────────────────────────────────────

export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  const snap = await getDocs(query(collection(db, 'events'), orderBy('date'), orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleEvent));
}

export function subscribeToSchedule(callback: (events: ScheduleEvent[]) => void) {
  const q = query(collection(db, 'events'), orderBy('date'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleEvent)));
  });
}

export async function getEvent(id: string): Promise<ScheduleEvent | null> {
  const snap = await getDoc(doc(db, 'events', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ScheduleEvent;
}

export async function createEvent(data: Omit<ScheduleEvent, 'id'>) {
  return addDoc(collection(db, 'events'), data);
}

export async function updateEvent(id: string, data: Partial<ScheduleEvent>) {
  await updateDoc(doc(db, 'events', id), data);
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, 'events', id));
}

// ─── Concert Program ────────────────────────────────────────────────────────

export function subscribeToConcertProgram(callback: (entries: ConcertProgramEntry[]) => void) {
  const q = query(collection(db, 'concertProgram'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ConcertProgramEntry)));
  });
}

export async function createConcertEntry(data: Omit<ConcertProgramEntry, 'id'>) {
  return addDoc(collection(db, 'concertProgram'), data);
}

export async function updateConcertEntry(id: string, data: Partial<ConcertProgramEntry>) {
  await updateDoc(doc(db, 'concertProgram', id), data);
}

export async function deleteConcertEntry(id: string) {
  await deleteDoc(doc(db, 'concertProgram', id));
}

// ─── People ─────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ ...d.data() } as User));
}

export async function getPreloadedAttendees(): Promise<PreloadedAttendee[]> {
  const snap = await getDocs(collection(db, 'preloadedAttendees'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PreloadedAttendee));
}

export function subscribeToUsers(callback: (users: User[]) => void) {
  return onSnapshot(collection(db, 'users'), (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data() } as User)));
  });
}

export async function updateUser(uid: string, data: Partial<User>) {
  await updateDoc(doc(db, 'users', uid), { ...data, lastActiveAt: serverTimestamp() });
}

// ─── Photos ─────────────────────────────────────────────────────────────────

export async function getPhotosByEvent(
  eventId: string,
  pageSize = 30,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ photos: Photo[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    collection(db, 'photos'),
    where('eventId', '==', eventId),
    orderBy('uploadedAt', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  const photos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Photo));
  return { photos, lastDoc: snap.docs[snap.docs.length - 1] || null };
}

export async function addPhoto(data: Omit<Photo, 'id'>) {
  return addDoc(collection(db, 'photos'), data);
}

export async function deletePhoto(id: string) {
  await deleteDoc(doc(db, 'photos', id));
}

export async function togglePhotoReaction(photoId: string, emoji: string, userId: string, hasReacted: boolean) {
  const ref = doc(db, 'photos', photoId);
  await updateDoc(ref, {
    [`reactions.${emoji}`]: hasReacted ? arrayRemove(userId) : arrayUnion(userId),
  });
}

// ─── Chats ───────────────────────────────────────────────────────────────────

export function subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void) {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat)));
  });
}

export function subscribeToMessages(chatId: string, callback: (msgs: Message[]) => void) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('sentAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
  });
}

export async function sendMessage(chatId: string, message: Omit<Message, 'id'>) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), message);
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: message.text.slice(0, 100),
    lastMessageAt: serverTimestamp(),
  });
}

export async function findOrCreateDM(uid1: string, uid2: string): Promise<string> {
  const q = query(
    collection(db, 'chats'),
    where('type', '==', 'dm'),
    where('participants', 'array-contains', uid1)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const participants: string[] = d.data().participants || [];
    return participants.includes(uid2);
  });
  if (existing) return existing.id;
  const newChat = await addDoc(collection(db, 'chats'), {
    type: 'dm',
    participants: [uid1, uid2],
    eraGroup: null,
    name: null,
    lastMessage: null,
    lastMessageAt: null,
    createdAt: serverTimestamp(),
  });
  return newChat.id;
}

export async function getEraGroupChat(era: string): Promise<Chat | null> {
  const q = query(collection(db, 'chats'), where('type', '==', 'group'), where('eraGroup', '==', era));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Chat;
}

export async function joinEraGroupChat(era: string, userId: string) {
  const chat = await getEraGroupChat(era);
  if (!chat) return;
  await updateDoc(doc(db, 'chats', chat.id), { participants: arrayUnion(userId) });
}

export async function leaveEraGroupChat(era: string, userId: string) {
  const chat = await getEraGroupChat(era);
  if (!chat) return;
  await updateDoc(doc(db, 'chats', chat.id), { participants: arrayRemove(userId) });
}

export async function markMessagesRead(chatId: string, messages: Message[], userId: string) {
  const batch = writeBatch(db);
  messages.forEach((msg) => {
    if (!msg.readBy.includes(userId)) {
      batch.update(doc(db, 'chats', chatId, 'messages', msg.id), {
        readBy: arrayUnion(userId),
      });
    }
  });
  await batch.commit();
}

// ─── Music ───────────────────────────────────────────────────────────────────

export function subscribeToMusic(callback: (music: Music[]) => void) {
  const q = query(collection(db, 'music'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Music)));
  });
}

export async function addMusic(data: Omit<Music, 'id'>) {
  return addDoc(collection(db, 'music'), data);
}

export async function deleteMusic(id: string) {
  await deleteDoc(doc(db, 'music', id));
}

// ─── Preloaded Attendees ─────────────────────────────────────────────────────

export async function claimPreloadedAttendee(preloadedId: string, userId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'preloadedAttendees', preloadedId), {
    matched: true,
    userId,
  });
  batch.update(doc(db, 'users', userId), {
    preloadedAttendeeId: preloadedId,
  });
  await batch.commit();
}

export async function batchImportAttendees(attendees: Array<{ name: string; graduationYear: number | null; era: string }>) {
  const batch = writeBatch(db);
  attendees.forEach((a) => {
    const ref = doc(collection(db, 'preloadedAttendees'));
    batch.set(ref, { ...a, matched: false });
  });
  await batch.commit();
}

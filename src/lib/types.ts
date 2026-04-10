import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  name: string;
  graduationYear: number | null;
  era: Era;
  location: string;
  profilePhotoUrl: string | null;
  isAdmin: boolean;
  onboarded: boolean;
  fcmToken: string | null;
  preloadedAttendeeId: string | null;
  notificationSettings: {
    announcements: boolean;
    dms: boolean;
    groupChats: boolean;
  };
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

export type Era = '60s' | '70s' | '80s' | '90s' | '00s' | '10s' | '20s' | 'Current Group' | 'Guest';

export const ERA_OPTIONS: Era[] = ['60s', '70s', '80s', '90s', '00s', '10s', '20s', 'Current Group', 'Guest'];

export function graduationYearToEra(year: number): Era {
  if (year >= 1960 && year <= 1969) return '60s';
  if (year >= 1970 && year <= 1979) return '70s';
  if (year >= 1980 && year <= 1989) return '80s';
  if (year >= 1990 && year <= 1999) return '90s';
  if (year >= 2000 && year <= 2009) return '00s';
  if (year >= 2010 && year <= 2019) return '10s';
  if (year >= 2020 && year <= 2026) return '20s';
  return '90s';
}

export interface PreloadedAttendee {
  id: string;
  name: string;
  graduationYear: number | null;
  era: Era;
  matched?: boolean;
  userId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  linkedEventId: string | null;
  imageUrl: string | null;
  createdAt: Timestamp;
  createdBy: string;
  sentAsPush: boolean;
  pushSentAt: Timestamp | null;
}

export type EventType = 'rehearsal' | 'social' | 'concert' | 'meal' | 'logistics';

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: EventType;
  order: number;
  isConcert: boolean;
}

export type ConcertEntryType = 'current-group' | 'era' | 'mixed-era' | 'video' | 'all-group';

export interface ConcertProgramEntry {
  id: string;
  order: number;
  type: ConcertEntryType;
  label: string;
  songs: string[];
  soloists: string[];
  notes: string | null;
}

export interface Photo {
  id: string;
  uploadedBy: string;
  uploaderName: string;
  eventId: string;
  eventTitle: string;
  photoUrl: string;
  thumbnailUrl: string;
  reactions: { [emoji: string]: string[] };
  uploadedAt: Timestamp;
  fileSize: number;
}

export type ChatType = 'dm' | 'group';

export interface Chat {
  id: string;
  type: ChatType;
  participants: string[];
  eraGroup: string | null;
  name: string | null;
  lastMessage: string | null;
  lastMessageAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl: string | null;
  text: string;
  sentAt: Timestamp;
  readBy: string[];
}

export interface Music {
  id: string;
  title: string;
  era: string | null;
  category: 'era-song' | 'all-group';
  pdfUrl: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  order: number;
}

export const EVENT_COLORS: Record<EventType, { border: string; badge: string }> = {
  rehearsal: { border: '#6B2D8B', badge: 'bg-purple-light text-purple-primary' },
  social: { border: '#FFCD00', badge: 'bg-gold-light text-yellow-800' },
  concert: { border: '#4A1F62', badge: 'bg-purple-primary text-white' },
  meal: { border: '#22C55E', badge: 'bg-green-100 text-green-800' },
  logistics: { border: '#9CA3AF', badge: 'bg-neutral-100 text-neutral-600' },
};

export const REACTION_EMOJIS = ['❤️', '🎵', '😂', '🔥', '👏'];

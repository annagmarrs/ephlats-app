# Ephlats Reunion App — Full Product Requirements
## For Claude Code: Build this app exactly as specified. Do not deviate from the stack, architecture, or feature specs without flagging it first.

---

## 1. Project Overview

Build a Progressive Web App (PWA) for the Williams College Ephlats a cappella group reunion, April 17–19, 2026. Approximately 100 alumni are attending. The app must be production-ready, mobile-first, and installable on both iOS (Safari → Add to Home Screen) and Android (Chrome install prompt).

This is a real event with real users. Every feature must work. Placeholder UI is not acceptable in the final build.

**Reunion dates:** April 17 (Friday) – April 19 (Sunday), 2026
**User count:** ~100 attendees
**App name:** Ephlats 2026
**Tagline:** "The Ephlats are back."

---

## 2. Tech Stack — Use Exactly This

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) | TypeScript throughout |
| Styling | Tailwind CSS | Mobile-first |
| PWA | next-pwa | Service worker, manifest, offline support |
| Backend/DB | Firebase (Firestore) | Real-time listeners for chat + gallery |
| Auth | Firebase Authentication | Email/password + Google OAuth |
| Storage | Firebase Storage | Photos, PDFs |
| Push Notifications | Firebase Cloud Messaging (FCM) | Web Push via service worker |
| Hosting | Vercel | Connect GitHub repo |
| Icons | Lucide React | Consistent icon set |
| Forms | React Hook Form + Zod | Validation |
| Toast notifications | React Hot Toast | User feedback |
| Image optimization | Next.js Image component | |
| PDF viewer | react-pdf or iframe embed | For sheet music |

**Do not add additional dependencies without a clear reason.**

---

## 3. Design System

### Colors
```css
--purple-primary: #6B2D8B;     /* Williams Purple — adjust to match logo */
--purple-dark: #4A1F62;        /* Darker purple for hover/active states */
--purple-light: #F3E8FB;       /* Light purple for backgrounds/chips */
--gold-primary: #FFCD00;       /* Williams Gold */
--gold-dark: #D4AA00;          /* Darker gold for hover states */
--gold-light: #FFF9D6;         /* Light gold for accents */
--neutral-900: #111827;        /* Primary text */
--neutral-600: #4B5563;        /* Secondary text */
--neutral-300: #D1D5DB;        /* Borders */
--neutral-100: #F3F4F6;        /* Backgrounds */
--white: #FFFFFF;
--error: #EF4444;
--success: #22C55E;
```

### Typography
- Font: **Inter** (Google Fonts) — import in layout.tsx
- Headings: font-bold, tracking-tight
- Body: font-normal, leading-relaxed
- Use Tailwind's default `rem`-based type scale: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

**CRITICAL — Accessibility (font scaling):** Users range from age 20 to 85. Many will have system-level Large Text enabled on their devices.
- **Never set `font-size` in `px` anywhere in the codebase.** Use `rem` or Tailwind's utility classes only (which are already `rem`-based).
- **Do not override the browser's base font size.** Do not add `html { font-size: 16px }` or any fixed base size. Let it inherit from the device.
- **All layout dimensions that affect text containers must scale too.** Use `min-h` instead of `h` for buttons and input fields where possible, so they grow when text is larger.
- **Line height:** Set globally to 1.6 for body text. Never less than 1.4.
- **Minimum touch target:** All tappable elements must be at least 44×44px. Use `min-h-[44px] min-w-[44px]` on interactive elements.
- **Color contrast:** All text must meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text). Do not use light gray text on white backgrounds.

### Spacing & Layout
- Max width for content: 480px on mobile, centered
- Bottom nav height: 64px (account for iOS safe area with pb-safe)
- Top header height: 56px
- Card border radius: rounded-2xl (16px)
- Button border radius: rounded-xl (12px)
- Standard padding: p-4 (16px) or p-5 (20px)

### Component Patterns
- **Cards:** white background, rounded-2xl, shadow-sm, border border-neutral-200
- **Primary buttons:** bg-purple-primary text-white rounded-xl h-12 font-semibold
- **Secondary buttons:** border border-purple-primary text-purple-primary bg-white rounded-xl h-12
- **Gold accent buttons:** bg-gold-primary text-neutral-900 rounded-xl h-12 font-semibold (use sparingly)
- **Input fields:** border border-neutral-300 rounded-xl h-12 px-4 focus:ring-2 focus:ring-purple-primary
- **Bottom sheet / modal:** slide up from bottom, rounded-t-2xl, backdrop blur

### Design Vibe
Fun and celebratory, not whimsical. Think: finished, polished, joyful. Purple and gold throughout but not garish. A professional app that happens to be for a fun event. No clip art, no gimmicks. Use white space generously.

---

## 4. Firebase Architecture

### Project Structure
- One Firebase project: `ephlats-2026`
- Enable: Authentication, Firestore, Storage, Cloud Messaging

### Firestore Collections

#### `users/{userId}`
```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;
  name: string;                   // Full name
  graduationYear: number;         // e.g., 1998
  era: '60s' | '70s' | '80s' | '90s' | '00s' | '10s' | '20s';
  location: string;               // City, State (e.g., "Boston, MA")
  profilePhotoUrl: string | null;
  isAdmin: boolean;               // Default false
  onboarded: boolean;             // Has completed onboarding flow
  fcmToken: string | null;        // Push notification token
  notificationSettings: {
    announcements: boolean;       // Always true, user cannot disable
    dms: boolean;                 // Default true
    groupChats: boolean;          // Default true
  };
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}
```

#### `preloadedAttendees/{id}`
```typescript
{
  name: string;
  graduationYear: number;
  era: string;
  // No email field — intentionally excluded to protect attendee PII
  // No auto-matching — pre-loaded entries are display-only in the directory
}
```

**No email, no auto-matching.** Pre-loaded attendees show in the People directory as "Not yet on the app" cards. When someone signs up, their own profile appears as a separate entry. There is no logic to merge or link the two — they simply coexist. The pre-loaded entries give the directory life before everyone has signed up. Once someone signs up, they'll naturally appear alongside their pre-loaded card; this is acceptable for a weekend event at this scale.

#### `announcements/{announcementId}`
```typescript
{
  title: string;
  body: string;
  linkedEventId: string | null;   // Optional link to a schedule event
  imageUrl: string | null;        // Optional image
  createdAt: Timestamp;
  createdBy: string;              // Admin userId
  sentAsPush: boolean;
  pushSentAt: Timestamp | null;
}
```

#### `events/{eventId}`
```typescript
{
  title: string;
  description: string;
  date: string;                   // 'YYYY-MM-DD'
  startTime: string;              // 'HH:MM' (24hr)
  endTime: string;                // 'HH:MM' (24hr)
  location: string;               // Venue/room name
  type: 'rehearsal' | 'social' | 'concert' | 'meal' | 'logistics';
  order: number;                  // For sorting within a day
  isConcert: boolean;             // If true, shows concert program + sheet music sub-sections
}
```
// Note: No livestreamUrl field. Livestream is handled externally via email.

#### `concertProgram/{id}`
```typescript
{
  order: number;                  // Performance order (1, 2, 3...)
  type: 'current-group' | 'era' | 'mixed-era' | 'video' | 'all-group';
  label: string;                  // Display name: "The 2026 Ephlats", "1960s", "90s & 00s", "Video Interlude", "All Ephlats"
  songs: string[];                // Song titles — empty array for 'video' type
  soloists: string[];             // e.g., ["Jane Smith '98", "John Doe '01"] — can be empty
  notes: string | null;           // Optional notes
}
```

**Concert program is admin-managed only.** There is no seed data for this collection. It starts empty.

**Empty state:** Before any program entries exist, the concert event detail page shows:
> "The concert program will be posted here before the show. Check back soon!"
> (displayed in a styled placeholder card with the concert gradient treatment)

**Program entry types (based on 2026 structure):**
- `current-group`: The active student group (appears first and last in the program)
- `video`: A video interlude — shows label only, no songs list
- `era`: A single era performing (60s, 70s, 80s, 90s, 00s, 10s, 20s)
- `mixed-era`: A cross-era performance (e.g., "90s & 00s") — label describes the combination
- `all-group`: All eras together

**2026 concert order (for reference when building admin UI):**
1. Current Group — "The 2026 Ephlats" (type: current-group)
2. Video (type: video)
3. 1960s (type: era)
4. 1970s (type: era)
5. 1980s (type: era)
6. 1990s (type: era)
7. 2000s (type: era)
8. 2010s (type: era)
9. 2020s (type: era)
10. Current Group — "The 2026 Ephlats" (type: current-group) — closing set
(Mixed-era entries may be inserted between eras at Anna's discretion)

#### `photos/{photoId}`
```typescript
{
  uploadedBy: string;             // userId
  uploaderName: string;           // Denormalized for display
  eventId: string;                // Which event/day this belongs to
  eventTitle: string;             // Denormalized for display
  photoUrl: string;               // Full-size URL
  thumbnailUrl: string;           // Compressed URL (generate on upload)
  reactions: {                    // Map of emoji → array of userIds
    [emoji: string]: string[];
  };
  uploadedAt: Timestamp;
  fileSize: number;               // bytes
}
```

#### `chats/{chatId}`
```typescript
{
  type: 'dm' | 'group';
  participants: string[];         // userIds (2 for DM, multiple for group)
  eraGroup: string | null;        // e.g., '90s' — only for group chats
  name: string | null;            // Display name for group chats
  lastMessage: string | null;
  lastMessageAt: Timestamp | null;
  createdAt: Timestamp;
}
```

#### `chats/{chatId}/messages/{messageId}`
```typescript
{
  senderId: string;
  senderName: string;             // Denormalized
  senderPhotoUrl: string | null;  // Denormalized
  text: string;
  sentAt: Timestamp;
  readBy: string[];               // Array of userIds who have read
}
```

#### `music/{musicId}`
```typescript
{
  title: string;                  // Song name
  era: string | null;             // '80s', '90s', etc. — null for all-group
  category: 'era-song' | 'all-group';
  pdfUrl: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  order: number;
}
```

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users — read all authenticated, write own doc only
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Preloaded attendees — admin write, all authenticated read
    match /preloadedAttendees/{id} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Announcements — admin write, all authenticated read
    match /announcements/{id} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Events — admin write, all authenticated read
    match /events/{id} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Concert program — admin write, all authenticated read
    match /concertProgram/{id} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Photos — any authenticated user can upload/react, admin can delete
    match /photos/{photoId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated(); // For reactions
      allow delete: if isAdmin() || isOwner(resource.data.uploadedBy);
    }

    // Chats — participants only, admin can read all
    match /chats/{chatId} {
      allow read: if isAuthenticated() &&
        (resource.data.participants.hasAny([request.auth.uid]) || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        (resource.data.participants.hasAny([request.auth.uid]) || isAdmin());

      match /messages/{messageId} {
        allow read: if isAuthenticated() &&
          (get(/databases/$(database)/documents/chats/$(chatId)).data.participants.hasAny([request.auth.uid]) || isAdmin());
        allow create: if isAuthenticated() &&
          get(/databases/$(database)/documents/chats/$(chatId)).data.participants.hasAny([request.auth.uid]);
        allow update, delete: if false;
      }
    }

    // Music — admin write, all authenticated read
    match /music/{id} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos
    match /profilePhotos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // Gallery photos
    match /galleryPhotos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    // Sheet music PDFs — admin upload, all authenticated read
    match /music/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Admin check handled in app layer
    }
  }
}
```

---

## 5. File Structure

```
ephlats-app/
├── public/
│   ├── manifest.json
│   ├── firebase-messaging-sw.js    # FCM service worker
│   ├── icons/
│   │   ├── icon-192x192.png        # App icon (placeholder — Anna to provide logo)
│   │   ├── icon-512x512.png
│   │   └── apple-touch-icon.png
│   └── splash/                     # Splash screen assets
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, Inter font, PWA meta tags
│   │   ├── page.tsx                # Redirect: if auth → /home, else → /auth
│   │   ├── auth/
│   │   │   ├── page.tsx            # Login + Sign Up toggle
│   │   │   └── onboarding/
│   │   │       └── page.tsx        # Multi-step onboarding flow
│   │   ├── (app)/                  # Authenticated route group
│   │   │   ├── layout.tsx          # Bottom nav + top header
│   │   │   ├── home/
│   │   │   │   └── page.tsx        # Welcome + announcements feed
│   │   │   ├── schedule/
│   │   │   │   ├── page.tsx        # Full weekend schedule
│   │   │   │   └── [eventId]/
│   │   │   │       └── page.tsx    # Event detail + concert program if applicable
│   │   │   ├── gallery/
│   │   │   │   ├── page.tsx        # Photo gallery by event
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx    # Upload flow
│   │   │   ├── people/
│   │   │   │   ├── page.tsx        # Attendee directory
│   │   │   │   └── [userId]/
│   │   │   │       └── page.tsx    # Individual profile view
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx        # Chat list (DMs + era group chats)
│   │   │   │   └── [chatId]/
│   │   │   │       └── page.tsx    # Individual chat thread
│   │   │   └── profile/
│   │   │       └── page.tsx        # Own profile + settings
│   │   └── admin/
│   │       ├── layout.tsx          # Admin nav + admin-only guard
│   │       ├── page.tsx            # Redirects to /admin/announcements
│   │       ├── schedule/
│   │       │   └── page.tsx
│   │       ├── concert/
│   │       │   └── page.tsx
│   │       ├── announcements/
│   │       │   └── page.tsx        # Default admin landing
│   │       ├── attendees/
│   │       │   └── page.tsx
│   │       ├── gallery/
│   │       │   └── page.tsx
│   │       └── music/
│   │           └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── SkeletonLoader.tsx
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx       # 5-tab bottom navigation
│   │   │   ├── TopHeader.tsx       # Page title + optional back button
│   │   │   └── AdminNav.tsx        # Admin sidebar/top nav
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── OnboardingSteps/
│   │   │       ├── StepName.tsx
│   │   │       ├── StepEra.tsx
│   │   │       ├── StepLocation.tsx
│   │   │       ├── StepPhoto.tsx
│   │   │       └── StepComplete.tsx
│   │   ├── home/
│   │   │   ├── AnnouncementCard.tsx
│   │   │   └── WelcomeBanner.tsx
│   │   ├── schedule/
│   │   │   ├── DaySection.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventTypeBadge.tsx
│   │   │   └── ConcertProgram.tsx
│   │   ├── gallery/
│   │   │   ├── PhotoGrid.tsx
│   │   │   ├── PhotoCard.tsx
│   │   │   ├── PhotoViewer.tsx     # Full-screen view with reactions + download
│   │   │   ├── BulkSelectBar.tsx   # Shows when in selection mode
│   │   │   ├── EmojiReactions.tsx
│   │   │   └── UploadForm.tsx
│   │   ├── InstallBanner.tsx       # Persistent PWA install instructions (see Section 13)
│   │   ├── people/
│   │   │   ├── AttendeeCard.tsx
│   │   │   ├── EraFilter.tsx
│   │   │   └── ProfileView.tsx
│   │   ├── chat/
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatListItem.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── EraChatSection.tsx
│   │   └── admin/
│   │       ├── ScheduleEditor.tsx
│   │       ├── ConcertEditor.tsx
│   │       ├── AnnouncementComposer.tsx
│   │       ├── AttendeeUploader.tsx
│   │       ├── GalleryModerator.tsx
│   │       └── MusicUploader.tsx
│   ├── lib/
│   │   ├── firebase.ts             # Firebase client config + app init
│   │   ├── firebase-admin.ts       # Firebase Admin SDK (server-side)
│   │   ├── auth.ts                 # Auth helpers
│   │   ├── firestore.ts            # Firestore query helpers
│   │   ├── storage.ts              # Storage upload helpers
│   │   ├── notifications.ts        # FCM helpers
│   │   ├── seed.ts                 # One-time seed script for schedule + attendees
│   │   └── types.ts                # All TypeScript types (mirrors Firestore schema)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAnnouncements.ts
│   │   ├── useSchedule.ts
│   │   ├── useGallery.ts
│   │   ├── usePeople.ts
│   │   ├── useChat.ts
│   │   └── useNotifications.ts
│   └── contexts/
│       └── AuthContext.tsx
├── next.config.js                  # PWA config via next-pwa
├── tailwind.config.ts              # Extended with brand colors
├── .env.local.example
├── .env.local                      # Never commit this
├── firebase.json
├── .firebaserc
└── package.json
```

---

## 6. Environment Variables

Create `.env.local` with the following. Values come from Firebase project settings and FCM.

```bash
# Firebase Client (safe to expose — security via rules)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FCM_VAPID_KEY=

# Firebase Admin (server-side only — never expose)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# App Config
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 7. PWA Configuration

### next.config.js
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'firebase-images',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
});
```

### public/manifest.json
```json
{
  "name": "Ephlats 2026",
  "short_name": "Ephlats",
  "description": "Williams College Ephlats Reunion App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#6B2D8B",
  "theme_color": "#6B2D8B",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

### Root layout.tsx — required PWA meta tags
Include in `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#6B2D8B" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Ephlats 2026" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

---

## 8. Push Notifications (FCM)

### public/firebase-messaging-sw.js
This file MUST be in /public and served at the root. It handles background push notifications.

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "REPLACE_WITH_ENV",           // Will be replaced at build time
  authDomain: "REPLACE_WITH_ENV",
  projectId: "REPLACE_WITH_ENV",
  storageBucket: "REPLACE_WITH_ENV",
  messagingSenderId: "REPLACE_WITH_ENV",
  appId: "REPLACE_WITH_ENV",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  });
});
```

**Note:** Use a Next.js build step or environment variable injection to populate the Firebase config values in this service worker file, since service workers cannot access `process.env`. Create a `/src/app/api/sw-config/route.ts` API route that returns the config, and have the service worker fetch it on install — OR use next-pwa's `publicExcludes` and a custom build step to inject values. Implement whichever approach is cleaner.

### Notification Flow
1. User grants notification permission during onboarding (step after profile complete)
2. On permission grant, get FCM token via `getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY })`
3. Store FCM token in `users/{userId}.fcmToken`
4. When admin sends an announcement, call a Next.js API route `/api/notify`
5. The API route uses Firebase Admin SDK to send FCM message to all users with tokens
6. For DM/group chat notifications: trigger via Firestore Cloud Function OR a Next.js API route called when a message is sent

### Push Notification Content Logic
When an admin sends an announcement with a push notification:
- **Notification title** = the announcement's `title` field (shown as the bold header in the OS notification)
- **Notification body** = the first 100 characters of the announcement's `body` field, trimmed at the last complete word before the cutoff, with "…" appended if truncated
- **Notification icon** = `/icons/icon-192x192.png`
- **Notification click action** = opens the app to `/home` (so they see the full announcement)

Example: announcement title "Rehearsal room change" + body "The 90s rehearsal has moved from Griffin 4 to Wachenheim 015. Please head there now." → notification shows "Rehearsal room change" / "The 90s rehearsal has moved from Griffin 4 to Wachenheim 015. Please head there…"

### Server-Side Notification Sending (/src/app/api/notify/route.ts)
- Verify the requesting user is an admin (check Firestore)
- Fetch all FCM tokens from users collection
- Send multicast FCM message via Firebase Admin SDK
- Batch in groups of 500 (FCM limit)
- Return success/failure count

### Chat Notification Sending (/src/app/api/chat-notify/route.ts)
- Called when a message is sent
- Fetch the chat document to get participants
- For DMs: send to the other participant if their `notificationSettings.dms === true`
- For group chats: send to all participants except sender if `notificationSettings.groupChats === true`
- Check that recipient's FCM token exists before sending

---

## 9. Feature Specifications

### 9.1 Auth + Onboarding

#### Auth Page (/auth)
- Default state: Sign In form
- Toggle between Sign In and Create Account
- Sign In: email + password fields, "Sign in with Google" button, forgot password link
- Create Account: email + password + confirm password, "Sign up with Google" button
- After email sign-up: send Firebase verification email, redirect to onboarding
- After Google sign-up: skip email verification, redirect to onboarding
- After sign-in: check `user.onboarded` — if false, redirect to /auth/onboarding; if true, redirect to /home
- Error states: display inline below the relevant field, not as alerts

#### Onboarding Flow (/auth/onboarding)
Multi-step, single-page flow with animated step transitions (slide left). Progress indicator at top (dots or step count). Back button between steps. Cannot skip steps.

**Step 1 — Name**
- Prompt: "What's your name?"
- Single input field, full name
- Subtext: "This is how you'll appear to other Ephlats."
- Validate: not empty, minimum 2 chars

**Step 2 — Era**
- Prompt: "What's your era?"
- Graduation year: numeric input (4 digits, range 1960–2026)
- Era dropdown: ['60s', '70s', '80s', '90s', '00s', '10s', '20s']
- Auto-suggest era based on graduation year as user types, but let them override
- Logic: 1960–1969 → 60s, 1970–1979 → 70s, etc., 2020–2026 → 20s
- On selecting era, also auto-join that era's group chat (add userId to chat participants)

**Step 3 — Location**
- Prompt: "Where are you based?"
- Single input: "City, State" (e.g., "Boston, MA")
- Subtext: "Helps you reconnect with nearby Ephlats."

**Step 4 — Photo (optional)**
- Prompt: "Add a profile photo"
- Subtext: "Optional, but your era-mates will love seeing your face."
- Buttons: "Upload a photo" + "Skip for now"
- On upload: show preview, allow crop (square), upload to Firebase Storage at `profilePhotos/{userId}/avatar.jpg`
- Compress before upload: max 500KB

**Step 5 — Notifications**
- Prompt: "Stay in the loop"
- Subtext: "We'll notify you about event updates, messages, and announcements. You can change this anytime."
- Single button: "Enable Notifications"
- Skip link: "Not now"
- On enable: request browser notification permission, save FCM token
- On skip: continue without token (they won't get push notifications)

**Step 6 — Welcome**
- "You're in! Welcome back, [name]."
- Show their era badge (e.g., "90s Ephlat")
- Confetti animation (use canvas-confetti library)
- Button: "Let's go" → navigate to /home
- Set `user.onboarded = true` in Firestore

#### Self-Identification Step (linking to preloaded attendee)

After Step 3 (Location), before the photo step, add an optional self-identification step:

**Step 3.5 — "Are you in our list?"**

- Prompt: "We've pre-loaded a list of expected attendees. Find yourself to connect your profile."
- Sub-prompt: "If your name looks different (nickname, maiden name, etc.), just search for it."
- UI: A search input pre-filled with the user's first name (from Step 1). Below it, a scrollable list of candidates.
- Skip link at bottom: "I don't see myself — continue anyway"

**Fuzzy search logic (client-side, runs against preloadedAttendees collection):**
1. Filter the pre-loaded list to only entries where `graduationYear` matches the user's entered graduation year (exact match — this eliminates most false positives)
2. Within those results, search by name using the following rules:
   - Tokenize both names (split on spaces)
   - Match if ANY token in the search query shares the first 3 characters with ANY token in the pre-loaded name (case-insensitive)
   - Example: "Stef" matches "Stefanie" (stef === stef), "Jon" matches "Jonathan" (jon === jon)
   - Note: This will NOT match Bill/William or Meg/Margaret — for those cases, the user can clear the search field and type their formal name manually
3. Show up to 10 matches, sorted by best match score
4. Each result shows: pre-loaded name + graduation year + era

**On selection:**
- User taps a result → "Is this you? [Name] '98, 90s era" with Confirm / Not me buttons
- On Confirm: update Firestore — set `preloadedAttendees/{id}.matched = true`, `preloadedAttendees/{id}.userId = user.uid`, and `users/{userId}.preloadedAttendeeId = preloadedAttendee.id`
- The pre-loaded entry is now "claimed" — it no longer shows in the directory as "Not yet on app" since the signed-up user profile takes its place

**No match / skipped:**
- User continues onboarding normally. They appear in the directory as a signed-up user. Their pre-loaded entry (if any) continues to show as "Not yet on app" until the event ends or an admin cleans it up. This is fine — a small number of unmatched duplicates are acceptable for a weekend event.

**Add `preloadedAttendeeId` back to the users schema:**
```typescript
preloadedAttendeeId: string | null; // Set when user self-identifies against preloadedAttendees
```

---

### 9.2 Home Screen (/home)

**Layout (top to bottom):**
1. Top header: Ephlats 2026 logo (centered) — use text logo with purple/gold styling until real logo asset is provided
2. Reunion countdown banner: "Reunion starts in X days" (before April 17) OR "Reunion is happening now!" (April 17–19) OR "Thank you for an incredible reunion." (after April 19). Dynamic based on current date.
3. Announcements feed: reverse-chronological list of admin announcements

**Announcement Card:**
- Title (bold, larger)
- Body text
- If `linkedEventId` is set: "View Event →" button that links to /schedule/[eventId]
- Timestamp (relative: "2 hours ago")
- No edit/delete for regular users

**Empty state:** "No announcements yet. Check back soon!"

**Pull to refresh:** supported

---

### 9.3 Schedule (/schedule and /schedule/[eventId])

#### Schedule List Page
- Grouped by day: Friday April 17, Saturday April 18, Sunday April 19
- Day headers are sticky
- Each event displayed as a card:
  - Color-coded left border by event type:
    - rehearsal → purple
    - social → gold
    - concert → deep purple (bg gradient)
    - meal → green (#22C55E)
    - logistics → gray
  - Event name (bold)
  - Time range (e.g., "2:00 PM – 4:00 PM")
  - Location
  - Event type badge
- Tap any event → /schedule/[eventId]

#### Event Type Color Map
```typescript
const eventColors = {
  rehearsal: { border: '#6B2D8B', badge: 'bg-purple-light text-purple-primary' },
  social: { border: '#FFCD00', badge: 'bg-gold-light text-yellow-800' },
  concert: { border: '#4A1F62', badge: 'bg-purple-primary text-white' },
  meal: { border: '#22C55E', badge: 'bg-green-100 text-green-800' },
  logistics: { border: '#9CA3AF', badge: 'bg-neutral-100 text-neutral-600' },
};
```

#### Concert Event Card — Special Treatment
The concert event card must look visually distinct from all other events. It should feel like the main event it is.

Apply the following treatment ONLY to the event card where `event.type === 'concert'`:

```tsx
// Concert card: full gradient background, gold accents, larger layout
<div className="rounded-2xl overflow-hidden shadow-lg">
  {/* Gradient header */}
  <div
    style={{ background: 'linear-gradient(135deg, #4A1F62 0%, #6B2D8B 60%, #8B3DAF 100%)' }}
    className="px-5 pt-5 pb-4"
  >
    {/* Star / music note icon row */}
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gold-primary text-lg">🎵</span>
      <span
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: '#FFCD00' }}
      >
        The Main Event
      </span>
    </div>
    <h3 className="text-white text-xl font-bold leading-tight">
      Ephlats 70th Reunion Concert
    </h3>
    <p className="text-purple-200 text-sm mt-1">Saturday, April 18 · 7:00 PM</p>
  </div>

  {/* Card body */}
  <div className="bg-white px-5 py-4">
    <div className="flex items-center gap-2 text-neutral-600 text-sm mb-3">
      <MapPinIcon className="w-4 h-4" />
      <span>Brooks-Rogers Recital Hall</span>
    </div>
    <p className="text-neutral-600 text-sm">
      Featuring performances from the 60s through the current group.
    </p>
    <div
      className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2"
      style={{ background: '#FFCD00', color: '#1a1a1a' }}
    >
      <span>🎟</span>
      <span>Please arrive at 6:30 PM for seating</span>
    </div>
  </div>
</div>
```

This card should be full-width (no left border strip like the other cards). The gradient goes dark-purple to medium-purple. Gold is used for accents and the arrival reminder bar. All other event types use the standard card with colored left border.

#### Event Detail Page (/schedule/[eventId])
- Back button → /schedule
- Event title, full date + time, location, description
- If `event.isConcert === true`: show Concert Program section below event details

**Concert Program Section:**

This section should feel like a real printed concert program — elegant, intentional, and celebratory.

- Section has a dark purple gradient header: "Tonight's Program" in white with a 🎵 icon
- Below the header, each performance is shown as a card in an ordered list
- Performance number shown as a gold circle with the number inside (e.g., ①, ②)
- Era name: large and bold (e.g., "The 90s")
- Songs listed below in a smaller italic style, separated by "·" or on separate lines
- All-group songs get a special gold background row labeled "All Eras Together" or "Full Ensemble" instead of a specific era
- Subtle divider between each performance entry
- At the very bottom of the program section: a small "Sheet Music" link that scrolls to the sheet music section

Visual reference for each performance card:
```
┌─────────────────────────────────┐
│ ① The 1990s                     │
│   Song Title One                │
│   Song Title Two                │
└─────────────────────────────────┘
```

The program as a whole should have a slightly off-white/cream background (#FAFAF7) to echo the feeling of a physical program insert.

**Sheet Music section (below concert program, if concert):**
- Section title: "Sheet Music"
- List of all PDFs from `music` collection sorted by `order`
- Each row: song title + era tag + "Open" button → opens PDF in new tab or in-app PDF viewer
- Admin can upload PDFs from the admin interface

// No livestream section. Removed by design — handled externally via email.

---

### 9.4 Gallery (/gallery and /gallery/upload)

#### Gallery Page

**Expected photo volume:** ~2,000–3,000 photos total (100 users × 20–30 photos). Pagination is required. A full render of 3,000 thumbnails would crash the browser.

**Default view:** Organized by event. Each event that has photos gets a section with a header (event name + photo count). Photos within each section shown in a 3-column grid.

**Pagination strategy:** Infinite scroll within each event section using Firestore cursor-based pagination (`startAfter`).
- Load 30 photos at a time per event section
- As the user scrolls near the bottom of an event section, fetch the next 30 (using `orderBy('uploadedAt', 'desc')` + `startAfter(lastDoc)`)
- Show a subtle loading indicator at the bottom of each section while fetching
- Each event section header shows total photo count (fetched separately as a count query)
- Use `React.memo` on photo thumbnail components to prevent unnecessary re-renders
- Thumbnail images must use `loading="lazy"` and Next.js Image component with `sizes` attribute appropriate for a 3-column grid

**Top controls bar:**
- "Upload" button (right aligned, gold background)
- "Select" button (left aligned, secondary style) — enters bulk selection mode

**Photo thumbnail:**
- Square, fills grid cell
- On long press OR when in selection mode: show selection circle
- Tap (normal mode): open PhotoViewer

**PhotoViewer (full-screen overlay):**
- Swipe left/right to navigate within same event section
- Photo fills screen, top has X close button and download button (single photo)
- Bottom: emoji reaction bar + uploader name + timestamp
- Emoji reactions: show emoji + count, tap to toggle your reaction
- Available emojis: ❤️ 🎵 😂 🔥 👏 — shown as a horizontal strip
- Download button: downloads full-size photo to device

**Bulk Selection Mode:**
- Tap "Select" → grid enters selection mode
- Each photo shows a circular checkbox
- Tap photos to select/deselect
- Bottom bar appears: "X photos selected | Download All | Cancel"
- "Download All" downloads all selected photos as individual files (use Promise.all with fetch + createObjectURL for each)
- "Cancel" exits selection mode

**Upload Flow (/gallery/upload):**
- Step 1: Choose photo (file input, accepts image/*)
- Show preview
- Step 2: Select which event to tag it to (dropdown of all schedule events, ordered by date/time)
- Upload button: compress client-side to max 1MB before upload, upload to Firebase Storage at `galleryPhotos/{eventId}/{photoId}.jpg`
- Generate thumbnail (max 400px wide) and upload separately at `galleryPhotos/{eventId}/thumb_{photoId}.jpg`
- On success: redirect to /gallery, show success toast
- On error: show error toast, keep form state

---

### 9.5 People (/people and /people/[userId])

#### Directory Page
**Header controls:**
- Search input: filters by name in real time (client-side filter on loaded data)
- Era filter: horizontal scrollable chip row — "All", "60s", "70s", "80s", "90s", "00s", "10s", "20s"

**Attendee display:**
Two view modes (toggle button in header):
- **Grid view (default):** 3 columns, avatar + name + era badge + status indicator
- **List view:** avatar + name + era + location + status indicator, full width rows

**Status indicator:**
- Preloaded attendee who has joined the app: full color card, shows their profile photo or initials avatar
- Preloaded attendee NOT yet on the app: subtly grayed out, shows initials only, small "Not on the app yet" label
- Users who signed up but weren't preloaded: same as joined (no distinction needed)

**Sort order:** Joined users first, sorted alphabetically. Not-yet-joined users below, sorted alphabetically.

#### Individual Profile Page (/people/[userId])
- Back button
- Profile photo (large, circular) or initials avatar with colored background
- Full name (large, bold)
- Era badge
- Graduation year
- Location
- "Send Message" button (gold, full width) → finds or creates DM chat, navigates to /chat/[chatId]
- If viewing own profile: "Edit Profile" button instead

**Own Profile is at /profile (not /people/[userId]) and includes:**
- All the same fields displayed
- Edit button on each field (or single "Edit Profile" → modal)
- Notification settings toggles (DMs on/off, Group Chats on/off)
- "Sign Out" button (bottom, secondary style, destructive)

---

### 9.6 Chat (/chat and /chat/[chatId])

#### Chat List Page
Two sections:

1. **Your Era Chat** (pinned at top, always visible)
   - Shows ONE group chat — the user's own era (e.g., "90s Ephlats")
   - Displayed as a prominent card at the top of the screen with era badge
   - Shows last message preview + timestamp + unread count badge
   - Tap → /chat/[chatId]
   - Users do NOT see other eras' group chats

2. **Direct Messages**
   - "New Message" button → opens a modal to search for a person by name
   - Existing DMs sorted by most recent activity
   - Each row: avatar + name + last message preview + timestamp + unread count badge
   - Tap → /chat/[chatId]

**Note:** All 7 era group chats still exist in Firestore, but each user only sees and can access the one matching their era. The Firestore security rules already enforce this via the participants array — when a user selects their era during onboarding, their userId is added to that era's group chat participants, and they can only read chats where they are a participant.

#### Chat Thread (/chat/[chatId])
- Top header: chat name (era or person's name) + back button
- Messages in reverse-chronological scroll (newest at bottom)
- Own messages: right-aligned, purple bubble, white text
- Other messages: left-aligned, gray bubble, dark text, show sender name above (for group chats)
- Real-time listener: `onSnapshot` on `chats/{chatId}/messages` ordered by `sentAt`
- Mark messages as read: add userId to `readBy` array on read
- Unread count: messages where `readBy` does not include current userId

**Message input bar (fixed bottom, above keyboard):**
- Text input, expands up to 4 lines
- Send button (purple, right of input)
- Handle keyboard appearance: adjust bottom padding when keyboard is visible (use `visualViewport` API)

**New DM Modal:**
- Search input → real-time filter of users
- Tap a person → check if DM chat already exists (query `chats` where `type=dm` and `participants` includes both userIds)
- If exists: navigate to that chat
- If not: create new `chats` document, navigate to it

---

### 9.7 Profile + Settings (/profile)

All profile fields are fully editable after onboarding. Users can change any field at any time.

**Editable fields:**
- Name
- Graduation year
- Era (dropdown) — **if a user changes their era, their group chat membership must update:** remove them from the old era's group chat participants array and add them to the new era's group chat participants array. This happens automatically on era change.
- Location
- Profile photo (tap to replace)

**Notification settings** (toggles):
- DM notifications: on/off
- Era group chat notifications: on/off
- Announcement notifications: always on, shown as locked/greyed toggle with explanation

**Account:**
- "Sign Out" button (bottom, full width, secondary destructive style)

**Profile editing UI:** tapping "Edit Profile" opens a form with all fields pre-filled. Single save button at the bottom. Inline validation. Success toast on save.

---

### 9.8 Admin Interface (/admin)

**Admin is a single user (Anna).** There is no admin management UI. Anna's account is made admin via a one-time CLI script run after deployment. All other users are non-admin and cannot access /admin routes.

Admin access: check `users/{userId}.isAdmin === true`. If not admin, redirect to /home immediately — do not show a 403 page.

Admin nav is a simple top navigation bar (not the mobile bottom nav). Function over style — clean, usable, no design polish required. Links: **Schedule | Concert | Announcements | Attendees | Gallery | Music**

No dashboard page. /admin redirects to /admin/announcements as the default landing.

#### Admin Schedule (/admin/schedule)
- Table of all events sorted by date/time
- Columns: Date, Time, Title, Location, Type, Actions (Edit | Delete)
- "Add Event" button → opens form (same fields as event schema)
- Edit: inline or modal form
- Delete: confirm before deleting

**Event form fields:**
- Title (text)
- Date (date picker)
- Start Time / End Time (time pickers)
- Location (text)
- Type (select: rehearsal / social / concert / meal / logistics)
- Description (textarea)
- Is Concert (checkbox) — if checked, this event shows concert program in its detail view

#### Admin Concert Program (/admin/concert)
- Title: "Concert Program"
- Ordered list of all program entries, shown as editable rows
- Up/down arrow buttons to reorder entries
- **Add entry** form with fields:
  - Type (select): Current Group | Era | Mixed Era | Video Interlude | All Ephlats
  - Label (text): auto-fills based on type selection, but editable (e.g., type "Era" → label "1970s"; type "Mixed Era" → label "90s & 00s")
  - Songs (textarea or tag input, comma-separated): hidden for "Video Interlude" type
  - Soloists (textarea, comma-separated): optional, hidden for "Video Interlude"
  - Notes (text): optional
- Edit/delete each entry inline
- Save button per row (or auto-save)
- No livestream URL field anywhere
- **Live preview panel** (desktop layout): shows what the concert program will look like in the app as entries are added. Updates in real time.

**Note:** Anna will enter the program on Saturday April 18 before the concert. The admin interface must be fast and mobile-usable since she may be doing this from her phone.

#### Admin Announcements (/admin/announcements)
- Compose form at top:
  - Title (text, required)
  - Message body (textarea, required)
  - Link to event: optional dropdown of all schedule events ("Select an event to link to...")
  - Send push notification: checkbox (default checked)
  - Preview: shows what the announcement card will look like
  - Submit button: "Post Announcement"
- On submit: create Firestore document in `announcements`, then if push checkbox checked, call `/api/notify`
- Below: list of past announcements (title + body + timestamp + "Sent push" badge)

#### Admin Attendees (/admin/attendees)
- Instructions at top: "Upload a CSV with three columns: name, graduationYear, era — no email addresses needed or accepted."
- CSV format required:
  ```
  name,graduationYear,era
  Jane Smith,1998,90s
  John Doe,1985,80s
  ```
- File input for CSV upload
- Parse client-side using PapaParse
- Validate each row: name must be non-empty, graduationYear must be 4-digit number between 1960–2026, era must be one of: 60s, 70s, 80s, 90s, 00s, 10s, 20s
- Preview table: shows all rows to be imported with a pass/fail indicator per row. Invalid rows shown in red with the specific error. Admin can proceed even with some invalid rows (they're skipped).
- Confirm import button → batch write valid rows to `preloadedAttendees` collection
- Below the upload section: current preloaded attendees list (name, grad year, era, "Not yet on app" badge)
- No auto-matching with signed-up users. Preloaded entries are display-only in the directory.

#### Admin Gallery (/admin/gallery)
- Grid of all photos across all events
- Each photo: image, uploader name, event tag, delete button
- Delete: removes from Firestore + Firebase Storage
- Filter by event (dropdown)
- No pagination needed (100 users × ~5 photos each = manageable)

#### Admin Music (/admin/music)
- Upload form: PDF file input, song title, era (dropdown or "all-group"), category
- List of uploaded PDFs: title, era, "Open" button, delete button
- Drag to reorder (or order number input)

---

## 10. Seed Data Scripts

Create `/src/lib/seed.ts` as a runnable Node.js script (`tsx src/lib/seed.ts`) that seeds initial data into Firestore.

### 10.1 Schedule Seed Data
Use the exact data below. Do not use placeholders.

```typescript
export const scheduleData = [
  // FRIDAY APRIL 17
  {
    title: 'Check-in & Reunion Packet Pick-up',
    description: 'Start your weekend here — check in, pick up your reunion packet, and say hello! Note: If you are arriving after Friday\'s check-in, registration will also be set up at Paresky Auditorium on Saturday during lunch and outside Brooks-Rogers before the concert.',
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
  // SATURDAY APRIL 18
  {
    title: 'Era Rehearsals',
    description: 'Rehearsals run 10am–12pm and again 3pm–5pm in Griffin Hall and the Wachenheim Science Building (NSB).\n\nRoom assignments:\n• 1960s — Griffin 4\n• 1970s — Griffin 5\n• 1980s — Griffin 6\n• 1990s — Wachenheim 015 & 017\n• 2000s — Wachenheim 113\n• 2010s — Wachenheim 114\n• 2020s — Wachenheim 116\n\nRefer to the campus map in your reunion packet to navigate.',
    date: '2026-04-18',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Griffin Hall & Wachenheim Science Building',
    type: 'rehearsal',
    isConcert: false,
    order: 3,
    // Note: second rehearsal slot 3pm–5pm should appear as a separate event
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
  // SUNDAY APRIL 19
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
```

### 10.2 Concert Program Seed Data
```typescript
export const concertProgramData = [
  { order: 1, era: '60s', songs: ['[Song 1]', '[Song 2]'], notes: null },
  { order: 2, era: '70s', songs: ['[Song 1]', '[Song 2]'], notes: null },
  { order: 3, era: '80s', songs: ['[Song 1]', '[Song 2]'], notes: null },
  { order: 4, era: '90s', songs: ['[Song 1]', '[Song 2]'], notes: null },
  { order: 5, era: '00s', songs: ['[Song 1]', '[Song 2]'], notes: null },
  { order: 6, era: '10s', songs: ['[Song 1]', '[Song 2]'], notes: null },
  { order: 7, era: '20s', songs: ['[Song 1]', '[Song 2]'], notes: null },
];
```

### 10.3 Preloaded Attendees
Anna will provide a CSV. The admin interface handles this upload. The seed script does not need to pre-populate attendees.

### 10.4 Era Group Chats Seed
The seed script MUST create the 7 era group chats on first run:

```typescript
export const eraGroupChats = [
  { era: '60s', name: "60s Ephlats" },
  { era: '70s', name: "70s Ephlats" },
  { era: '80s', name: "80s Ephlats" },
  { era: '90s', name: "90s Ephlats" },
  { era: '00s', name: "00s Ephlats" },
  { era: '10s', name: "10s Ephlats" },
  { era: '20s', name: "20s Ephlats" },
];
// Create as type: 'group', participants: [], eraGroup: era, name: name
```

---

## 11. Error Handling + Loading States

- All async operations: show loading spinner or skeleton during load
- Firestore reads: use skeleton loaders that match the shape of the content (not generic spinners)
- Failed uploads: toast error + keep form state so user doesn't lose progress
- Offline: detect with `navigator.onLine`, show a banner "You're offline — some content may be outdated"
- Auth errors: display inline, specific messages ("No account found with this email" not "auth/user-not-found")
- Image load errors: show initials avatar as fallback for profile photos

---

## 12. Offline / Caching Behavior

- Enable Firestore offline persistence: `enableIndexedDbPersistence(db)` on client init
- Service worker (via next-pwa) caches:
  - App shell (layout, fonts, icons)
  - Firebase Storage images (CacheFirst, 30 day TTL)
- When offline: app shows cached data with offline banner
- Write attempts while offline: Firestore queues them and syncs when reconnected

---

## 13. App Access Model + Install Instructions

### How the App Works on Different Devices

**Important principle:** The app works in ANY browser on ANY device. Installing to the home screen is optional but recommended — it gives a full-screen app feel and enables push notifications. Users who don't install can still use every feature except push notifications.

| Device + Browser | Can Install to Home Screen? | Push Notifications? | Experience |
|---|---|---|---|
| iPhone — Safari | ✅ Yes (Share → Add to Home Screen) | ✅ iOS 16.4+ only | Full app experience |
| iPhone — Chrome | ❌ No (Apple restriction) | ❌ No | Full web app in browser — all features work |
| iPhone — Firefox/Edge/any other | ❌ No (Apple restriction) | ❌ No | Full web app in browser — all features work |
| Android — Chrome | ✅ Yes (auto install prompt) | ✅ Yes | Full app experience |
| Android — Firefox | ✅ Yes (Add to Home Screen in menu) | ✅ Yes | Full app experience |
| Android — Samsung Browser | ✅ Yes | ✅ Yes | Full app experience |
| Android — any browser | ✅ Usually yes | ✅ Usually yes | Full app experience |
| Desktop (any browser) | ❌ Not applicable | ❌ No | Full web experience — works fine |

**Key point for iPhone users:** They must use Safari to install. If they're using Chrome on their iPhone and try to install, the banner will show instructions to open the link in Safari instead. The app still fully works in Chrome on iPhone — they just won't get a home screen icon or push notifications.

### InstallBanner Component

Create `<InstallBanner />` — a persistent banner visible whenever the user is accessing the app via a browser (not installed). Place it inside `(app)/layout.tsx` so it appears on every authenticated page.

**Device/browser detection:**
```typescript
const isInstalled =
  window.navigator.standalone === true ||                    // iOS installed PWA
  window.matchMedia('(display-mode: standalone)').matches;  // Android installed PWA

const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
const isIOSSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
const isIOSNonSafari = isIOS && !isIOSSafari;  // Chrome, Firefox, Edge, etc. on iOS
const isAndroid = /Android/.test(ua);
const isDesktop = !isIOS && !isAndroid;
```

**Banner behavior by detected context:**

**iOS Safari (not installed):**
- Gold banner: "Add to your home screen for the best experience"
- Instructional line with icon: "Tap [share icon] then 'Add to Home Screen'"
- Include an actual inline SVG of the iOS Share icon so it's unambiguous
- Dismiss (×) closes for this session only; re-appears on next visit

**iOS non-Safari Chrome/Firefox/etc. (not installed):**
- Gold banner: "To install the app on your iPhone, open this link in Safari"
- Show a button: "Copy Link" (copies current URL to clipboard)
- Secondary text: "The app works in your current browser too — you just won't get a home screen icon."
- This is important: do NOT leave them stranded. They can still use the app fully.

**Android (not installed):**
- Intercept and store the `beforeinstallprompt` event
- Gold banner: "Add Ephlats 2026 to your home screen"
- Button: "Install" — triggers the stored `beforeinstallprompt` event
- If `beforeinstallprompt` not available (already dismissed / not supported), show: "Tap your browser menu (⋮) → 'Add to Home Screen'"
- Dismiss (×) closes for the session

**Already installed (any platform):**
- Render null immediately. No banner, no flicker.

**Desktop:**
- Slim neutral (not gold) banner: "Ephlats 2026 is designed for mobile — open it on your phone for the best experience"
- Show the app URL prominently so they can copy it to their phone
- Dismiss (×) persists via localStorage on desktop only (desktop users won't be installing anyway)

**Visual design:**
- Gold background (#FFCD00), dark text (#111827), small but legible font size
- Full width, slim (not a modal or bottom sheet)
- Sits directly below the top app header
- Dismiss button (×) right-aligned
- The banner takes priority visual space — don't hide it under the header

## 14. iOS-Specific Considerations

- **Safe area insets:** Use `pb-safe` and `pt-safe` classes (configure Tailwind with safe-area-inset values) so content isn't hidden behind iPhone notch or home indicator
- **Keyboard handling:** When a text input is focused and keyboard appears, the chat input bar and any form at the bottom of the screen must scroll up appropriately. Use `visualViewport` API.
- **Viewport height:** Use `100dvh` (dynamic viewport height) instead of `100vh` to avoid issues with iOS Safari's address bar
- **PWA push notifications:** Require iOS 16.4+. If user is on older iOS, show a message in the notification settings: "To receive push notifications, update to iOS 16.4 or later."

---

## 14. Responsive Design

- **Mobile (< 640px):** Primary design target. All features fully functional.
- **Tablet / Desktop (≥ 640px):** Content is centered with max-width 480px. Admin interface uses a wider layout.
- **Admin interface:** Functional at all widths, optimized for desktop (min 768px).

---

## 15. Implementation Order

Build in this sequence. Each phase should be fully functional before moving to the next.

**Phase 1 — Foundation**
1. Project setup: Next.js + TypeScript + Tailwind + next-pwa
2. Firebase initialization (client + admin)
3. Tailwind config with brand colors
4. Base UI components (Button, Input, Card, Avatar)
5. Auth flow (login, signup, Google OAuth)
6. Onboarding flow (all 5 steps)
7. Bottom nav layout
8. Deploy to Vercel (confirm PWA installability)

**Phase 2 — Core Features**
9. Home screen (announcements feed)
10. Schedule (list + event detail)
11. People / Directory
12. Profile page + editing

**Phase 3 — Social Features**
13. Photo gallery (view + react + download)
14. Photo upload with event tagging
15. Bulk select + bulk download
16. 1:1 DM chat
17. Era group chats

**Phase 4 — Notifications + Admin**
18. Push notification permission + FCM token storage
19. Admin interface: Announcements (default landing), Schedule, Attendees, Gallery, Music
20. Server-side push notification sending (with title/body truncation logic)
21. Chat notifications (DM + era group chat)
22. Concert program admin editor + public view with empty state
23. Sheet music (admin upload + public view)

**Phase 5 — Polish + Launch**
24. Seed script for schedule data
25. InstallBanner component (browser detection + install instructions)
26. Offline banner
27. Accessibility pass: verify all font sizes in rem, touch targets ≥44px, contrast ratios
28. End-to-end test on real iPhone (Safari) and Android (Chrome)
29. Deploy final build to Vercel

---

## 16. What Anna Needs to Provide Before / During Launch

**Before launch (before April 17):**
1. **App icons** — 192×192, 512×512, and 180×180 PNG versions of the Ephlats logo. Until provided, use a purple square with "E" as a placeholder.
2. **Attendee CSV** — name, graduationYear, era (no email). Uploaded by Anna via the admin interface after deployment. Format: `name,graduationYear,era` one row per person.
3. **Sheet music PDFs** — uploaded by Anna via admin/music after deployment.

**On Saturday April 18 (day of concert):**
4. **Concert program** — Entered by Anna via /admin/concert on her phone before the show. This is the last piece of content to go live. The app shows a "Check back soon" empty state until it's entered.

**Never needed:**
- ~~YouTube livestream URL~~ — removed
- ~~Attendee emails~~ — removed for PII reasons
- Concert program seed data — admin-managed only

---

## 17. Deployment

1. Connect GitHub repo to Vercel
2. Add all environment variables in Vercel project settings
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. After deploy: verify PWA manifest is served correctly (check Chrome DevTools → Application)
6. Verify FCM push notifications work end-to-end on a real device
7. Set `NEXT_PUBLIC_APP_URL` to the actual Vercel URL

### Custom Domain (optional)
If Anna has a custom domain, configure it in Vercel project settings → Domains. Update Firebase Auth authorized domains to include the custom domain.

---

## 18. Performance Targets

- Lighthouse PWA score: ≥ 90
- First Contentful Paint: < 2s on mobile
- Time to Interactive: < 3s on mobile
- Photo uploads: compress client-side before upload, max 1MB per photo
- Gallery: lazy-load images using Next.js Image component with blur placeholder

---

*Built for Williams College Ephlats Reunion, April 17–19, 2026.*
*Stack: Next.js 14 + Firebase + Vercel. Questions about this spec: ask Anna.*

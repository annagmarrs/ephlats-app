/**
 * Firebase Admin SDK — server-side only.
 * Uses lazy initialization so it doesn't run at build time.
 * All exports are functions — call them inside request handlers only.
 */

/* eslint-disable */
const admin = require('firebase-admin');

let initialized = false;

function init() {
  if (initialized || admin.apps.length) {
    initialized = true;
    return;
  }
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '';
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
  initialized = true;
}

export function getAdminDb() {
  init();
  return admin.firestore() as import('firebase-admin').firestore.Firestore;
}

export function getAdminAuth() {
  init();
  return admin.auth() as import('firebase-admin').auth.Auth;
}

export function getAdminMessaging() {
  init();
  return admin.messaging() as import('firebase-admin').messaging.Messaging;
}

/**
 * Make-admin script — run ONCE with: npm run make-admin your@email.com
 * Sets isAdmin: true on the user with the given email.
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
const auth = admin.auth();

async function makeAdmin(email: string) {
  const userRecord = await auth.getUserByEmail(email);
  await db.collection('users').doc(userRecord.uid).update({ isAdmin: true });
  console.log(`✓ ${email} (${userRecord.uid}) is now an admin.`);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run make-admin your@email.com');
  process.exit(1);
}

makeAdmin(email)
  .then(() => process.exit(0))
  .catch((err) => { console.error('Error:', err.message); process.exit(1); });

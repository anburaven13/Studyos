import { cert, initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Support both local JSON file and Vercel environment variables
let credential: any;
try {
  // Try local service account file first (for development)
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const serviceAccount = require('./service-account.json');
  credential = cert(serviceAccount);
} catch (_error) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      // Robustly clean up the private key
      // 1. Remove wrapping quotes if the user accidentally copied them
      let pk = process.env.FIREBASE_PRIVATE_KEY || '';
      if (pk.startsWith('"') && pk.endsWith('"')) {
        pk = pk.substring(1, pk.length - 1);
      }
      // 2. Replace literal '\n' characters with actual newlines
      pk = pk.replace(/\\n/g, '\n');

      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: pk,
      } as any);
    }
  } catch (envError) {
    console.error("Firebase Admin initialization failed: Missing or invalid environment variables", envError);
  }
}

try {
  if (getApps().length === 0) {
    if (credential) {
      initializeApp({ credential });
    } else {
      console.warn("WARNING: Firebase Admin initialized with DUMMY config. APIs will fail, but server will boot.");
      initializeApp({ projectId: 'dummy-project' });
    }
  }
} catch (initError) {
  console.error("Firebase init fallback failed:", initError);
}

export const auth = getAuth(getApp());

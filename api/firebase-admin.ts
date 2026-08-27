import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let serviceAccount;


// Support both local JSON file and Vercel environment variables
let credential;
try {
  const serviceAccount = require('./service-account.json');
  credential = admin.credential.cert(serviceAccount);
} catch (error) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      });
    }
  } catch (envError) {
    console.error("Firebase Admin initialization failed: Missing or invalid environment variables");
  }
}

if (!admin.apps.length) {
  if (credential) {
    admin.initializeApp({ credential });
  } else {
    console.warn("WARNING: Firebase Admin initialized WITHOUT credentials. API calls will fail.");
    admin.initializeApp();
  }
}

export const auth = admin.auth();

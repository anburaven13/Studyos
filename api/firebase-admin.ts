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
  // If JSON is missing (e.g. on Vercel), use environment variables
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Handle Vercel escaping newlines in private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential
  });
}

export const auth = admin.auth();

import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let serviceAccount;

try {
  const serviceAccountPath = path.resolve(__dirname, 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }
} catch (error) {
  console.error("Failed to load service-account.json for Firebase Admin:", error);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault()
  });
}

export const auth = admin.auth();

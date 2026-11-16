import { cert, initializeApp } from 'firebase-admin/app';

/** Connects scripts to the Firebase project described by the loaded env file. */
export function initAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!projectId || !b64) {
    console.error('Set FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT_B64 in the env file first.');
    process.exit(1);
  }
  const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  console.log(`→ Firebase project: ${projectId}`);
  return initializeApp({ credential: cert(serviceAccount), projectId });
}

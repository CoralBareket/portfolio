import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env, isProd } from './env';

function createApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  if (isProd) {
    if (!env.FIREBASE_SERVICE_ACCOUNT_B64)
      throw new Error('FIREBASE_SERVICE_ACCOUNT_B64 is required in production');
    const serviceAccount = JSON.parse(
      Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8'),
    );
    return initializeApp({ credential: cert(serviceAccount), projectId: env.FIREBASE_PROJECT_ID });
  }

  // Dev/test: the emulator env vars route every call to the local emulators.
  if (!env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIRESTORE_EMULATOR_HOST must be set outside production (see .env.example)');
  }
  return initializeApp({ projectId: env.FIREBASE_PROJECT_ID });
}

const app = createApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

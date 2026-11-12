import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env, isProd } from './env';
import { notConfigured } from './errors';
import { logger } from './logger';

export type FirebaseClients = { db: Firestore; auth: Auth };

let cached: FirebaseClients | null | undefined;

function createApp(): App | null {
  const existing = getApps()[0];
  if (existing) return existing;

  // Real project: production, or the separate free "dev" project used for local development.
  if (env.FIREBASE_SERVICE_ACCOUNT_B64) {
    const serviceAccount = JSON.parse(
      Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8'),
    );
    return initializeApp({ credential: cert(serviceAccount), projectId: env.FIREBASE_PROJECT_ID });
  }

  // Emulator: only used by the integration tests in the deploy workflow.
  if (env.FIRESTORE_EMULATOR_HOST) return initializeApp({ projectId: env.FIREBASE_PROJECT_ID });

  if (isProd) throw new Error('FIREBASE_SERVICE_ACCOUNT_B64 is required in production');
  return null;
}

/**
 * Lazily connects to Firebase. Returns `null` in local development when no Firebase
 * project is configured: the API then serves the built-in CV content.
 */
export function getFirebase(): FirebaseClients | null {
  if (cached !== undefined) return cached;
  const app = createApp();
  if (!app) {
    logger.warn('Firebase is not configured: serving built-in content (see .env.example)');
    cached = null;
  } else {
    cached = { db: getFirestore(app), auth: getAuth(app) };
  }
  return cached;
}

/** Firestore, or a 503 "not configured" error for endpoints that can't work without it. */
export function requireDb(): Firestore {
  const fb = getFirebase();
  if (!fb) throw notConfigured('Firebase');
  return fb.db;
}

export function requireAuth(): Auth {
  const fb = getFirebase();
  if (!fb) throw notConfigured('Firebase');
  return fb.auth;
}

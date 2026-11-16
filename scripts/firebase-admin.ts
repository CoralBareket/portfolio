import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app';

/** Connects scripts to the Firebase project described by the loaded env file (or CI env). */
export function initAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  // Pasted secrets often pick up spaces or line breaks; base64 never contains them.
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64?.replace(/\s/g, '');
  if (!projectId) fail('FIREBASE_PROJECT_ID is empty (in CI it is a repository *variable*).');
  if (!b64) fail('FIREBASE_SERVICE_ACCOUNT_B64 is empty (in CI it is a repository *secret*).');

  let serviceAccount: { project_id?: string; client_email?: string; private_key?: string };
  try {
    serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch {
    return fail(
      'FIREBASE_SERVICE_ACCOUNT_B64 is not valid base64-encoded JSON. Copy it again as one unbroken line.',
    );
  }
  if (!serviceAccount.private_key || !serviceAccount.client_email) {
    fail('FIREBASE_SERVICE_ACCOUNT_B64 decodes to JSON, but not to a service account key.');
  }
  if (serviceAccount.project_id && serviceAccount.project_id !== projectId) {
    fail(
      `FIREBASE_PROJECT_ID is "${projectId}" but the service account belongs to "${serviceAccount.project_id}".`,
    );
  }
  console.log(`→ Firebase project: ${projectId}`);
  return initializeApp({ credential: cert(serviceAccount as ServiceAccount), projectId });
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

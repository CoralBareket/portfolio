import { getFirebase } from '../src/lib/firebase';

export function emulatorClients() {
  const fb = getFirebase();
  if (!fb || !process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('Integration tests run under `pnpm test:emulators` (Firebase emulators)');
  }
  return fb;
}

/** Deletes every document in the emulator's database (emulator-only REST endpoint). */
export async function clearFirestore() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  const project = process.env.FIREBASE_PROJECT_ID ?? 'demo-portfolio';
  await fetch(`http://${host}/emulator/v1/projects/${project}/databases/(default)/documents`, {
    method: 'DELETE',
  });
}

/** Creates a user in the Auth emulator and returns a real ID token for it. */
export async function idTokenFor(email: string, claims?: Record<string, unknown>): Promise<string> {
  const { auth } = emulatorClients();
  const password = 'test-password-123';
  const user = await auth.createUser({ email, password }).catch(() => auth.getUserByEmail(email));
  await auth.setCustomUserClaims(user.uid, claims ?? null);
  const res = await fetch(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const body = (await res.json()) as { idToken?: string };
  if (!body.idToken) throw new Error(`Auth emulator sign-in failed: ${JSON.stringify(body)}`);
  return body.idToken;
}

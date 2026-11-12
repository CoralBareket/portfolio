import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, describe, it } from 'vitest';

const rulesPath = fileURLToPath(new URL('../../firebase/firestore.rules', import.meta.url));
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-portfolio',
    firestore: { rules: readFileSync(rulesPath, 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

const collections = ['content', 'projects', 'messages', 'cv', 'stats_daily', 'ratelimits'];

describe('Firestore rules: the browser has no direct access', () => {
  for (const name of collections) {
    it(`anonymous users cannot read or write ${name}`, async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, name, 'x')));
      await assertFails(setDoc(doc(db, name, 'x'), { a: 1 }));
    });

    it(`even the admin account cannot touch ${name} directly (only via the API)`, async () => {
      const db = testEnv.authenticatedContext('coral', { admin: true }).firestore();
      await assertFails(getDoc(doc(db, name, 'x')));
      await assertFails(setDoc(doc(db, name, 'x'), { a: 1 }));
    });
  }
});

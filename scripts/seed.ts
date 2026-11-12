/**
 * Seeds the LOCAL Firestore emulator with the CV content.
 * Refuses to run against anything that isn't the emulator, so it can never touch production.
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defaultContent } from '../packages/shared/src/index';

process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
const projectId = 'demo-portfolio';

if (!projectId.startsWith('demo-')) throw new Error('Seed only runs against a demo-* emulator project');

const db = getFirestore(initializeApp({ projectId }));

await db.collection('content').doc('site').set(defaultContent);
console.log(`Seeded content/site into the emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);

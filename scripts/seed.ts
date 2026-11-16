/**
 * Writes the CV-based default content to `content/site` if it doesn't exist yet.
 *   pnpm seed            (dev project, .env.local)
 *   pnpm seed --force    (overwrite existing content)
 */
import { getFirestore } from 'firebase-admin/firestore';
import { defaultContent } from '../packages/shared/src/index';
import { initAdmin } from './firebase-admin';

const force = process.argv.includes('--force');
const ref = getFirestore(initAdmin()).collection('content').doc('site');

if ((await ref.get()).exists && !force) {
  console.log('content/site already exists, leaving it alone (use --force to overwrite).');
} else {
  await ref.set(defaultContent);
  console.log('✓ Seeded content/site with the CV content.');
}

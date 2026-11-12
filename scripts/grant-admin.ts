/**
 * One-time: gives a Firebase user the `admin` custom claim.
 *   pnpm admin:grant coral.bareket@gmail.com                       (dev project, .env.local)
 *   pnpm tsx --env-file=.env.production.local scripts/grant-admin.ts coral.bareket@gmail.com
 * Sign in once at /admin first, so the user exists.
 */
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from './firebase-admin';

const email = process.argv[2];
if (!email) {
  console.error('Usage: pnpm admin:grant <email>');
  process.exit(1);
}

const auth = getAuth(initAdmin());
try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  console.log(`✓ ${email} is now an admin. Sign out and back in at /admin to refresh the session.`);
} catch (err) {
  if ((err as { code?: string }).code === 'auth/user-not-found') {
    console.error(`No user with ${email}. Sign in once at /admin with Google, then run this again.`);
    process.exit(1);
  }
  throw err;
}

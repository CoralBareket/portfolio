import { createMiddleware } from 'hono/factory';
import { AppError } from '../lib/errors';
import { requireAuth } from '../lib/firebase';
import { logger } from '../lib/logger';

export type AdminVariables = { admin: { uid: string; email?: string } };

/**
 * Verifies the Firebase ID token on every admin request and requires the `admin`
 * custom claim (set once with `pnpm admin:grant`). Signing in alone grants nothing.
 */
export const requireAdmin = createMiddleware<{ Variables: AdminVariables }>(async (c, next) => {
  const header = c.req.header('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new AppError(401, 'unauthenticated', 'Sign in required');

  let decoded;
  try {
    decoded = await requireAuth().verifyIdToken(token, true);
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.warn({ err }, 'invalid id token');
    throw new AppError(401, 'unauthenticated', 'Invalid or expired session');
  }
  if (decoded.admin !== true) throw new AppError(403, 'forbidden', 'This account is not an admin');

  c.set('admin', { uid: decoded.uid, email: decoded.email });
  await next();
});

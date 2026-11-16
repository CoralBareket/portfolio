import { Timestamp } from 'firebase-admin/firestore';
import { requireDb } from '../lib/firebase';

/**
 * Fixed-window counters in `ratelimits/{key}`. Keys contain a salted hash, never a raw IP.
 * Each document carries `expiresAt` so the nightly cleanup can delete old windows.
 */
export const rateLimitRepository = {
  /** Atomically increments the window and returns the new count. */
  async hit(key: string, windowMs: number, now = Date.now()): Promise<number> {
    const db = requireDb();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const ref = db.collection('ratelimits').doc(`${key}_${windowStart}`);
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const count = ((snap.data()?.count as number | undefined) ?? 0) + 1;
      tx.set(ref, { count, expiresAt: Timestamp.fromMillis(windowStart + windowMs) });
      return count;
    });
  },
};

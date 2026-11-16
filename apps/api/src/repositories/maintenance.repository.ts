import { Timestamp } from 'firebase-admin/firestore';
import { requireDb } from '../lib/firebase';

export const maintenanceRepository = {
  /** Deletes expired rate-limit windows (TTL policies need a paid plan, so a cron does it). */
  async deleteExpiredRateLimits(now = new Date(), batchSize = 400): Promise<number> {
    const db = requireDb();
    let deleted = 0;
    for (;;) {
      const snap = await db
        .collection('ratelimits')
        .where('expiresAt', '<', Timestamp.fromDate(now))
        .limit(batchSize)
        .get();
      if (snap.empty) return deleted;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deleted += snap.size;
      if (snap.size < batchSize) return deleted;
    }
  },
};

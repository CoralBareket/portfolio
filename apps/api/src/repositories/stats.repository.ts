import { FieldValue } from 'firebase-admin/firestore';
import { getFirebase } from '../lib/firebase';
import { israelDay } from '../lib/time';

/**
 * Daily counters in `stats_daily/{YYYY-MM-DD}`. Every update is a single blind
 * `increment` write: no reads, so analytics stay far inside the free quota.
 */
export const statsRepository = {
  async increment(fields: Record<string, number>, date = new Date()): Promise<void> {
    const fb = getFirebase();
    if (!fb) return;
    const update: Record<string, FieldValue | string> = { date: israelDay(date) };
    for (const [key, by] of Object.entries(fields)) update[key] = FieldValue.increment(by);
    await fb.db.collection('stats_daily').doc(israelDay(date)).set(update, { merge: true });
  },
};

import { FieldValue } from 'firebase-admin/firestore';
import { getFirebase, requireDb } from '../lib/firebase';
import { israelDay } from '../lib/time';

/** Counter increments: top-level numbers, or one level of named buckets (e.g. referrers["Direct"]). */
export type StatIncrements = Record<string, number | Record<string, number>>;

/** Raw `stats_daily/{YYYY-MM-DD}` document. */
export type DailyStatsDoc = { date: string } & Record<string, number | Record<string, number> | string>;

/**
 * Daily counters in `stats_daily/{YYYY-MM-DD}`. Every update is a single blind
 * `increment` write: no reads, so analytics stay far inside the free quota.
 */
export const statsRepository = {
  async increment(fields: StatIncrements, date = new Date()): Promise<void> {
    const fb = getFirebase();
    if (!fb) return;
    const day = israelDay(date);
    const update: Record<string, unknown> = { date: day };
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'number') {
        update[key] = FieldValue.increment(value);
      } else {
        // Nested maps merge deeply with { merge: true }, so bucket names may contain "/" or ".".
        update[key] = Object.fromEntries(
          Object.entries(value).map(([k, by]) => [k, FieldValue.increment(by)]),
        );
      }
    }
    await fb.db.collection('stats_daily').doc(day).set(update, { merge: true });
  },

  /** Days in [from, to] inclusive (YYYY-MM-DD strings sort chronologically). */
  async listRange(from: string, to: string): Promise<DailyStatsDoc[]> {
    const snap = await requireDb()
      .collection('stats_daily')
      .where('date', '>=', from)
      .where('date', '<=', to)
      .get();
    return snap.docs.map((d) => d.data() as DailyStatsDoc);
  },
};

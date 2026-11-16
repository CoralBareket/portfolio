import type { SiteContent } from '@portfolio/shared';
import { getFirebase, requireDb } from '../lib/firebase';

export const contentRepository = {
  /** `null` when nothing is stored yet, or when no Firebase project is configured locally. */
  async get(): Promise<SiteContent | null> {
    const fb = getFirebase();
    if (!fb) return null;
    const snap = await fb.db.collection('content').doc('site').get();
    return snap.exists ? (snap.data() as SiteContent) : null;
  },
  async set(content: SiteContent): Promise<void> {
    await requireDb().collection('content').doc('site').set(content);
  },
};

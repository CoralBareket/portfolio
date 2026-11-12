import type { SiteContent } from '@portfolio/shared';
import { AppError } from '../lib/errors';
import { getFirebase } from '../lib/firebase';

const siteDoc = () => {
  const fb = getFirebase();
  return fb ? fb.db.collection('content').doc('site') : null;
};

export const contentRepository = {
  /** `null` when nothing is stored yet, or when no Firebase project is configured locally. */
  async get(): Promise<SiteContent | null> {
    const ref = siteDoc();
    if (!ref) return null;
    const snap = await ref.get();
    return snap.exists ? (snap.data() as SiteContent) : null;
  },
  async set(content: SiteContent): Promise<void> {
    const ref = siteDoc();
    if (!ref) throw new AppError(503, 'firebase_not_configured', 'Firebase is not configured');
    await ref.set(content);
  },
};

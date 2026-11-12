import type { SiteContent } from '@portfolio/shared';
import { db } from '../lib/firebase';

const siteDoc = () => db.collection('content').doc('site');

export const contentRepository = {
  async get(): Promise<SiteContent | null> {
    const snap = await siteDoc().get();
    return snap.exists ? (snap.data() as SiteContent) : null;
  },
  async set(content: SiteContent): Promise<void> {
    await siteDoc().set(content);
  },
};

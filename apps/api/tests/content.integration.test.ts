import { beforeEach, describe, expect, it } from 'vitest';
import { defaultContent } from '@portfolio/shared';
import { createApp } from '../src/app';
import { db } from '../src/lib/firebase';

/** Runs against the Firestore emulator (pnpm test:emulators). */
describe('GET /api/content (emulator)', () => {
  beforeEach(async () => {
    await db.collection('content').doc('site').delete();
  });

  it('returns what is stored in Firestore', async () => {
    const custom = { ...defaultContent, hero: { ...defaultContent.hero, tagline: 'From the emulator' } };
    await db.collection('content').doc('site').set(custom);

    const res = await createApp().request('/api/content');
    const body = (await res.json()) as { content: typeof custom };
    expect(body.content.hero.tagline).toBe('From the emulator');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { defaultContent } from '@portfolio/shared';
import { createApp } from '../src/app';
import { clearFirestore, emulatorClients } from './helpers';

describe('GET /api/content (emulator)', () => {
  const { db } = emulatorClients();
  const app = createApp();

  beforeEach(clearFirestore);

  it('returns stored content and only published projects, in order', async () => {
    await db
      .collection('content')
      .doc('site')
      .set({ ...defaultContent, hero: { ...defaultContent.hero, tagline: 'From the emulator' } });
    await db.collection('projects').add({ slug: 'b', title: 'B', order: 2, published: true, tags: [] });
    await db.collection('projects').add({ slug: 'a', title: 'A', order: 1, published: true, tags: [] });
    await db
      .collection('projects')
      .add({ slug: 'draft', title: 'Draft', order: 0, published: false, tags: [] });

    const res = await app.request('/api/content');
    const body = (await res.json()) as {
      content: typeof defaultContent;
      projects: { slug: string }[];
      cvAvailable: boolean;
    };
    expect(body.content.hero.tagline).toBe('From the emulator');
    expect(body.projects.map((p) => p.slug)).toEqual(['a', 'b']);
    expect(body.cvAvailable).toBe(false);
  });

  it('falls back to the CV defaults when nothing is stored', async () => {
    const body = (await (await app.request('/api/content')).json()) as { content: typeof defaultContent };
    expect(body.content.hero.name).toBe('Coral Bareket');
  });

  it('GET /api/cv 404s without a CV, then counts and redirects once one exists', async () => {
    expect((await app.request('/api/cv')).status).toBe(404);

    await db.collection('cv').doc('current').set({
      url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/portfolio-dev/cv/x.pdf',
      publicId: 'portfolio-dev/cv/x',
      fileName: 'Coral Bareket CV.pdf',
    });
    const res = await app.request('/api/cv');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/upload/fl_attachment:Coral_Bareket_CV/');

    const stats = await db.collection('stats_daily').get();
    expect(stats.docs[0]?.data().cvDownloads).toBe(1);
  });
});

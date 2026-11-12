import { describe, expect, it, vi } from 'vitest';

// Unit tests don't need Firestore: stub the repository layer.
vi.mock('./repositories/content.repository', () => ({
  contentRepository: { get: vi.fn().mockResolvedValue(null), set: vi.fn() },
}));

const { createApp } = await import('./app');

describe('public API', () => {
  const app = createApp();

  it('GET /api/health returns ok', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  it('GET /api/content falls back to CV defaults and is CDN-cacheable', async () => {
    const res = await app.request('/api/content');
    const body = (await res.json()) as { content: { hero: { name: string } } };
    expect(res.status).toBe(200);
    expect(body.content.hero.name).toBe('Coral Bareket');
    expect(res.headers.get('cache-control')).toContain('s-maxage');
  });

  it('unknown routes return the error envelope', async () => {
    const res = await app.request('/api/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: 'not_found' } });
  });
});

import { describe, expect, it } from 'vitest';
import { createApp } from './app';

// No Firebase configured in unit tests: the public API must still serve the CV content.
describe('public API without a database', () => {
  const app = createApp();

  it('GET /api/health returns ok', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  it('GET /api/content falls back to CV defaults and is CDN-cacheable', async () => {
    const res = await app.request('/api/content');
    const body = (await res.json()) as {
      content: { hero: { name: string } };
      projects: unknown[];
      cvAvailable: boolean;
    };
    expect(res.status).toBe(200);
    expect(body.content.hero.name).toBe('Coral Bareket');
    expect(body.projects).toEqual([]);
    expect(body.cvAvailable).toBe(false);
    expect(res.headers.get('cache-control')).toContain('s-maxage');
  });

  it('unknown routes return the error envelope', async () => {
    const res = await app.request('/api/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: 'not_found' } });
  });

  it('invalid contact input returns validation details', async () => {
    const res = await app.request('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'nope' }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string; details: { path: string }[] } };
    expect(body.error.code).toBe('validation_error');
    expect(body.error.details.map((d) => d.path)).toEqual(expect.arrayContaining(['name', 'email']));
  });

  it('admin routes require a token', async () => {
    const res = await app.request('/api/admin/projects');
    expect(res.status).toBe(401);
  });
});

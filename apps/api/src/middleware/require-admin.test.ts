import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';

const verifyIdToken = vi.fn();
vi.mock('../lib/firebase', () => ({ requireAuth: () => ({ verifyIdToken }) }));

const { requireAdmin } = await import('./require-admin');
const { errorHandler } = await import('./error-handler');

const app = new Hono().use('*', requireAdmin).get('/secret', (c) => c.text('ok'));
app.onError(errorHandler);
const call = (token?: string) =>
  app.request('/secret', { headers: token ? { Authorization: `Bearer ${token}` } : {} });

describe('requireAdmin', () => {
  it('rejects requests without a token (401)', async () => {
    expect((await call()).status).toBe(401);
  });

  it('rejects invalid tokens (401)', async () => {
    verifyIdToken.mockImplementation(async () => {
      throw new Error('bad token');
    });
    expect((await call('bad')).status).toBe(401);
  });

  it('rejects signed-in users without the admin claim (403)', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'someone', email: 'x@example.com' });
    expect((await call('valid')).status).toBe(403);
  });

  it('lets the admin through and checks for revoked tokens', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'coral', admin: true });
    const res = await call('valid');
    expect(res.status).toBe(200);
    expect(verifyIdToken).toHaveBeenCalledWith('valid', true);
  });
});

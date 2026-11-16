import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { clearFirestore, emulatorClients, idTokenFor } from './helpers';

/** End-to-end admin auth with real Firebase ID tokens from the Auth emulator. */
describe('admin API (emulator)', () => {
  const { db } = emulatorClients();
  const app = createApp();
  let adminToken = '';
  let visitorToken = '';

  const call = (path: string, token: string, init: RequestInit = {}) =>
    app.request(`/api/admin${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

  beforeAll(async () => {
    adminToken = await idTokenFor('coral@example.com', { admin: true });
    visitorToken = await idTokenFor('visitor@example.com');
  });
  beforeEach(clearFirestore);

  it('a signed-in user without the admin claim gets 403', async () => {
    expect((await call('/projects', visitorToken)).status).toBe(403);
  });

  it('the admin can create, list, update and delete a project', async () => {
    const created = await call('/projects', adminToken, {
      method: 'POST',
      body: JSON.stringify({ slug: 'ml-runner', title: 'ML Runner', published: true }),
    });
    expect(created.status).toBe(201);
    const { project } = (await created.json()) as { project: { id: string } };

    const dup = await call('/projects', adminToken, {
      method: 'POST',
      body: JSON.stringify({ slug: 'ml-runner', title: 'Duplicate' }),
    });
    expect(dup.status).toBe(409);

    const updated = await call(`/projects/${project.id}`, adminToken, {
      method: 'PUT',
      body: JSON.stringify({ slug: 'ml-runner', title: 'ML Runner v2', published: true }),
    });
    expect(((await updated.json()) as { project: { title: string } }).project.title).toBe('ML Runner v2');

    const publicRes = await app.request('/api/projects/ml-runner');
    expect(publicRes.status).toBe(200);

    expect((await call(`/projects/${project.id}`, adminToken, { method: 'DELETE' })).status).toBe(204);
    expect((await app.request('/api/projects/ml-runner')).status).toBe(404);
  });

  it('inbox lists messages newest first with an unread count, and marks them read', async () => {
    const older = await db.collection('messages').add({
      name: 'A',
      email: 'a@example.com',
      message: 'first message',
      status: 'unread',
      createdAt: new Date('2026-01-01'),
    });
    await db.collection('messages').add({
      name: 'B',
      email: 'b@example.com',
      message: 'second message',
      status: 'unread',
      createdAt: new Date('2026-02-01'),
    });

    const inbox = (await (await call('/messages', adminToken)).json()) as {
      messages: { name: string }[];
      unread: number;
    };
    expect(inbox.messages.map((m) => m.name)).toEqual(['B', 'A']);
    expect(inbox.unread).toBe(2);

    const patched = await call(`/messages/${older.id}`, adminToken, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'read' }),
    });
    expect(patched.status).toBe(200);
    const after = (await (await call('/messages', adminToken)).json()) as { unread: number };
    expect(after.unread).toBe(1);
  });

  it('rejects content that fails validation', async () => {
    const res = await call('/content', adminToken, { method: 'PUT', body: JSON.stringify({ hero: {} }) });
    expect(res.status).toBe(400);
  });

  it('refuses a CV URL that is not from our Cloudinary folder', async () => {
    const res = await call('/cv', adminToken, {
      method: 'PUT',
      body: JSON.stringify({ url: 'https://evil.example/cv.pdf', publicId: 'x', fileName: 'cv.pdf' }),
    });
    expect(res.status).toBe(400);
  });
});

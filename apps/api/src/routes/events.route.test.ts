import { beforeEach, describe, expect, it, vi } from 'vitest';

const increment = vi.fn();
vi.mock('../repositories/stats.repository', () => ({ statsRepository: { increment } }));

const { createApp } = await import('../app');

const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/140.0 Safari/537.36';
const body = JSON.stringify({
  firstVisitToday: true,
  isNewVisitor: true,
  newSession: true,
  events: [{ type: 'pageview', path: '/' }],
});

const post = (headers: Record<string, string>, payload = body, ip = '10.0.0.1') =>
  createApp().request('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'x-forwarded-for': ip, ...headers },
    body: payload,
  });

describe('POST /api/events', () => {
  beforeEach(() => increment.mockClear());

  it('accepts a sendBeacon text/plain batch with one write', async () => {
    const res = await post({ 'user-agent': BROWSER });
    expect(res.status).toBe(204);
    expect(increment).toHaveBeenCalledTimes(1);
  });

  it('drops bots and Do-Not-Track requests without writing', async () => {
    expect((await post({ 'user-agent': 'Googlebot/2.1' })).status).toBe(204);
    expect((await post({ 'user-agent': BROWSER, dnt: '1' })).status).toBe(204);
    expect(increment).not.toHaveBeenCalled();
  });

  it('rejects malformed batches', async () => {
    expect((await post({ 'user-agent': BROWSER }, 'not json')).status).toBe(400);
    expect((await post({ 'user-agent': BROWSER }, '{"events":"x"}')).status).toBe(400);
  });

  it('rate-limits a flood from one client', async () => {
    const app = createApp();
    const send = () =>
      app.request('/api/events', {
        method: 'POST',
        headers: { 'user-agent': BROWSER, 'x-forwarded-for': '10.9.9.9' },
        body,
      });
    const statuses = [];
    for (let i = 0; i < 32; i++) statuses.push((await send()).status);
    expect(statuses.filter((s) => s === 429).length).toBe(2);
  });
});

import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { AnalyticsSummary } from '@portfolio/shared';
import { createApp } from '../src/app';
import { clearFirestore, idTokenFor } from './helpers';

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1';

describe('analytics pipeline (emulator)', () => {
  const app = createApp();
  let adminToken = '';

  const beacon = (payload: object, ip: string) =>
    app.request('/api/events', {
      method: 'POST',
      headers: { 'user-agent': UA, 'x-forwarded-for': ip, host: 'coralbareket.vercel.app' },
      body: JSON.stringify(payload),
    });

  beforeAll(async () => {
    adminToken = await idTokenFor('coral-analytics@example.com', { admin: true });
  });
  beforeEach(clearFirestore);

  it('beacons become daily counters that the dashboard summarizes', async () => {
    // Two visitors: one from LinkedIn who scrolls and clicks, one direct.
    await beacon(
      {
        newSession: true,
        referrer: 'https://www.linkedin.com/',
        events: [{ type: 'pageview', path: '/' }],
      },
      '10.1.0.1',
    );
    await beacon(
      {
        newSession: false,
        events: [
          { type: 'section_view', section: 'stack' },
          { type: 'section_view', section: 'experience' },
          { type: 'click', target: 'github' },
        ],
      },
      '10.1.0.1',
    );
    await beacon(
      {
        newSession: true,
        events: [{ type: 'pageview', path: '/' }],
      },
      '10.1.0.2',
    );

    const res = await app.request('/api/admin/analytics?range=7d', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const s = (await res.json()) as AnalyticsSummary;

    expect(s.totals).toMatchObject({ pageviews: 2, sessions: 2 });
    expect(s.referrers).toEqual(
      expect.arrayContaining([
        ['LinkedIn', 1],
        ['Direct', 1],
      ]),
    );
    expect(s.clicks).toEqual([['github', 1]]);
    expect(s.daily).toHaveLength(7);
    expect(s.daily.at(-1)?.pageviews).toBe(2);

    const csv = await app.request('/api/admin/analytics.csv?range=7d', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(csv.headers.get('content-type')).toContain('text/csv');
    const lines = (await csv.text()).trim().split('\n');
    expect(lines[0]).toBe('date,pageviews,cvDownloads,contacts');
    expect(lines[1]).toMatch(/^\d{4}-\d{2}-\d{2},2,0,0$/);
  });

  it('cleanup cron requires the secret', async () => {
    expect((await app.request('/api/cron/cleanup')).status).toBe(401);
  });
});

import { describe, expect, it } from 'vitest';
import type { EventBatch } from '@portfolio/shared';
import { buildIncrements } from './events.service';

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const batch = (over: Partial<EventBatch>): EventBatch => ({
  firstVisitToday: false,
  isNewVisitor: false,
  newSession: false,
  referrer: '',
  utmSource: '',
  events: [],
  ...over,
});

// 2026-11-14 09:30 UTC = 11:30 in Israel (UTC+2 in November).
const NOW = new Date('2026-11-14T09:30:00Z');

describe('buildIncrements', () => {
  it('counts a first visit: page view, unique, new visitor, session, source and device', () => {
    const inc = buildIncrements(
      batch({
        firstVisitToday: true,
        isNewVisitor: true,
        newSession: true,
        referrer: 'https://www.linkedin.com/feed/',
        utmSource: 'LinkedIn',
        events: [{ type: 'pageview', path: '/' }],
      }),
      IPHONE,
      'coralbareket.vercel.app',
      NOW,
    );
    expect(inc).toEqual({
      pageviews: 1,
      pages: { '/': 1 },
      hours: { '11': 1 },
      uniques: 1,
      newVisitors: 1,
      sessions: 1,
      referrers: { LinkedIn: 1 },
      utm: { linkedin: 1 },
      devices: { mobile: 1 },
      browsers: { Safari: 1 },
      os: { iOS: 1 },
    });
  });

  it('later batches in a session only add their events', () => {
    const inc = buildIncrements(
      batch({
        events: [
          { type: 'section_view', section: 'experience' },
          { type: 'click', target: 'github' },
          { type: 'click', target: 'github' },
        ],
      }),
      CHROME_MAC,
      'coralbareket.vercel.app',
      NOW,
    );
    expect(inc).toEqual({ sections: { experience: 1 }, clicks: { github: 2 } });
  });

  it('ignores unknown sections and buckets unknown paths as "other"', () => {
    const inc = buildIncrements(
      batch({
        events: [
          { type: 'section_view', section: 'evil-section-name' },
          { type: 'pageview', path: '/wp-admin.php' },
          { type: 'pageview', path: '/projects/ml-runner' },
        ],
      }),
      CHROME_MAC,
      '',
      NOW,
    );
    expect(inc.sections).toBeUndefined();
    expect(inc.pages).toEqual({ other: 1, '/projects/ml-runner': 1 });
  });

  it('treats internal navigation as Direct', () => {
    const inc = buildIncrements(
      batch({ newSession: true, referrer: 'https://coralbareket.vercel.app/projects/x', events: [] }),
      CHROME_MAC,
      'coralbareket.vercel.app',
      NOW,
    );
    expect(inc.referrers).toEqual({ Direct: 1 });
    expect(inc.devices).toEqual({ desktop: 1 });
    expect(inc.browsers).toEqual({ Chrome: 1 });
    expect(inc.os).toEqual({ macOS: 1 });
  });
});

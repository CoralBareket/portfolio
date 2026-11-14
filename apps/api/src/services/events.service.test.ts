import { describe, expect, it } from 'vitest';
import type { EventBatch } from '@portfolio/shared';
import { buildIncrements } from './events.service';

const batch = (over: Partial<EventBatch>): EventBatch => ({
  newSession: false,
  referrer: '',
  events: [],
  ...over,
});

describe('buildIncrements', () => {
  it('counts the first batch of a visit: page view, visit and source', () => {
    const inc = buildIncrements(
      batch({
        newSession: true,
        referrer: 'https://www.linkedin.com/feed/',
        events: [{ type: 'pageview', path: '/' }],
      }),
      'coralbareket.vercel.app',
    );
    expect(inc).toEqual({ pageviews: 1, sessions: 1, referrers: { LinkedIn: 1 } });
  });

  it('later batches in a visit only add their events', () => {
    const inc = buildIncrements(
      batch({
        events: [
          { type: 'section_view', section: 'experience' },
          { type: 'click', target: 'github' },
          { type: 'click', target: 'github' },
        ],
      }),
      'coralbareket.vercel.app',
    );
    expect(inc).toEqual({ sections: { experience: 1 }, clicks: { github: 2 } });
  });

  it('ignores unknown section names', () => {
    const inc = buildIncrements(batch({ events: [{ type: 'section_view', section: 'evil-section' }] }), '');
    expect(inc).toEqual({});
  });

  it('treats internal navigation as Direct', () => {
    const inc = buildIncrements(
      batch({ newSession: true, referrer: 'https://coralbareket.vercel.app/projects/x' }),
      'coralbareket.vercel.app',
    );
    expect(inc.referrers).toEqual({ Direct: 1 });
  });
});

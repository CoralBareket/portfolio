import { describe, expect, it } from 'vitest';
import type { DailyStatsDoc } from '../repositories/stats.repository';
import { addDays, summarize } from './analytics.service';

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('summarize', () => {
  const docs: DailyStatsDoc[] = [
    {
      date: '2026-11-13',
      pageviews: 30,
      sessions: 12,
      cvDownloads: 2,
      contacts: 1,
      referrers: { LinkedIn: 8, Direct: 4 },
      sections: { stack: 12, focus: 11, experience: 5, about: 3, contact: 2 },
      clicks: { github: 3 },
    },
    { date: '2026-11-14', pageviews: 10, sessions: 6, referrers: { LinkedIn: 4, Direct: 2 } },
  ];
  const s = summarize('7d', docs, '2026-11-08', '2026-11-14');

  it('sums totals', () => {
    expect(s.totals).toEqual({ pageviews: 40, sessions: 18, cvDownloads: 2, contacts: 1 });
  });

  it('fills every day of the range, including days without data', () => {
    expect(s.daily).toHaveLength(7);
    expect(s.daily[0]).toEqual({ date: '2026-11-08', pageviews: 0 });
    expect(s.daily.at(-1)).toEqual({ date: '2026-11-14', pageviews: 10 });
  });

  it('merges breakdowns across days, sorted by count', () => {
    expect(s.referrers).toEqual([
      ['LinkedIn', 12],
      ['Direct', 6],
    ]);
    expect(s.clicks).toEqual([['github', 3]]);
  });

  it('writes plain-language insights', () => {
    expect(s.insights).toEqual([
      'LinkedIn brought 67% of visits.',
      'Most visitors leave before the Experience section.',
      '2 CV downloads and 1 message in this period.',
    ]);
  });

  it('says so when there is no data yet', () => {
    expect(summarize('30d', [], '2026-10-16', '2026-11-14').insights).toEqual([
      'No visits recorded in this period yet.',
    ]);
  });
});

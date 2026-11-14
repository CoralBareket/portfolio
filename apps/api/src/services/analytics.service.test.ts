import { describe, expect, it } from 'vitest';
import type { DailyStatsDoc } from '../repositories/stats.repository';
import { addDays, summarize } from './analytics.service';

const day = (date: string, over: Partial<DailyStatsDoc> = {}): DailyStatsDoc => ({
  date,
  pageviews: 10,
  uniques: 5,
  sessions: 6,
  newVisitors: 4,
  ...over,
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('summarize', () => {
  const current = [
    day('2026-11-13', {
      pageviews: 30,
      uniques: 10,
      sessions: 12,
      cvDownloads: 2,
      contacts: 1,
      referrers: { LinkedIn: 8, Direct: 4 },
      sections: { stack: 12, focus: 11, experience: 5, about: 3, contact: 2 },
      hours: { '14': 20, '09': 10 },
      pages: { '/': 30 },
    }),
    day('2026-11-14', { pageviews: 10, uniques: 5, sessions: 6, referrers: { LinkedIn: 4, Direct: 2 } }),
  ];
  const previous = [day('2026-11-07', { pageviews: 20 })];
  const s = summarize('7d', current, previous, '2026-11-08', '2026-11-14');

  it('sums totals and compares with the previous period', () => {
    expect(s.totals).toMatchObject({ pageviews: 40, uniques: 15, sessions: 18, cvDownloads: 2, contacts: 1 });
    expect(s.previous?.pageviews).toBe(20);
  });

  it('fills every day of the range, including days without data', () => {
    expect(s.daily).toHaveLength(7);
    expect(s.daily[0]).toEqual({ date: '2026-11-08', pageviews: 0, uniques: 0 });
    expect(s.daily.at(-1)).toEqual({ date: '2026-11-14', pageviews: 10, uniques: 5 });
  });

  it('merges breakdowns across days, sorted by count', () => {
    expect(s.referrers).toEqual([
      ['LinkedIn', 12],
      ['Direct', 6],
    ]);
    expect(s.hours[14]).toBe(20);
    expect(s.hours[9]).toBe(10);
  });

  it('writes plain-language insights', () => {
    expect(s.insights).toEqual(
      expect.arrayContaining([
        'Views up 100% vs the previous 7 days, mostly from LinkedIn.',
        'LinkedIn brought 67% of sessions.',
        'Most visitors leave before the Experience section.',
        '13% of visitors downloaded the CV and 7% sent a message.',
        'Busiest hour: 14:00–15:00 (Israel time).',
      ]),
    );
  });

  it('says so when there is no data yet', () => {
    expect(summarize('30d', [], [], '2026-10-16', '2026-11-14').insights).toEqual([
      'No visits recorded in this period yet.',
    ]);
  });
});

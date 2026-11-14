import { describe, expect, it } from 'vitest';
import { classifyReferrer, normalizeUtm } from './referrer';
import { isBot, parseUserAgent } from './user-agent';

describe('classifyReferrer', () => {
  it.each([
    ['', 'Direct'],
    ['not a url', 'Direct'],
    ['https://www.linkedin.com/in/someone', 'LinkedIn'],
    ['https://lnkd.in/abc', 'LinkedIn'],
    ['https://github.com/CoralBareket', 'GitHub'],
    ['https://www.google.co.il/', 'Google'],
    ['https://news.ycombinator.com/item?id=1', 'news.ycombinator.com'],
  ])('%s → %s', (ref, expected) => {
    expect(classifyReferrer(ref, 'coralbareket.vercel.app')).toBe(expected);
  });

  it('normalizes utm sources', () => {
    expect(normalizeUtm(' LinkedIn ')).toBe('linkedin');
    expect(normalizeUtm('<script>')).toBe('script');
  });
});

describe('user agent helpers', () => {
  it('recognizes crawlers and empty user agents as bots', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
    expect(isBot('')).toBe(true);
  });

  it('buckets Android tablets and Edge correctly', () => {
    expect(parseUserAgent('Mozilla/5.0 (Linux; Android 14; SM-T870) Chrome/140 Safari/537.36').device).toBe(
      'tablet',
    );
    expect(parseUserAgent('Mozilla/5.0 (Windows NT 10.0) Chrome/140 Safari/537.36 Edg/140').browser).toBe(
      'Edge',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { classifyReferrer } from './referrer';
import { isBot } from './user-agent';

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
});

describe('user agent helpers', () => {
  it('recognizes crawlers and empty user agents as bots', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
    expect(isBot('')).toBe(true);
  });
});

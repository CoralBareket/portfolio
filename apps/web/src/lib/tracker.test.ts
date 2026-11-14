import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventBatch } from '@portfolio/shared';
import { __resetTracker, trackPageview } from './tracker';

const sendBeacon = vi.fn((_url: string, _data: Blob) => true);

async function sentBatches(): Promise<EventBatch[]> {
  return Promise.all(
    sendBeacon.mock.calls.map(([, blob]) => blob.text().then((t) => JSON.parse(t) as EventBatch)),
  );
}

describe('tracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    sendBeacon.mockClear();
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
    Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true });
    __resetTracker();
  });
  afterEach(() => vi.useRealTimers());

  it('sends the first page view with the one-time visit flag, then never repeats it', async () => {
    trackPageview('/');
    vi.advanceTimersByTime(1600);
    trackPageview('/projects/demo');
    vi.advanceTimersByTime(1600);

    const [first, second] = await sentBatches();
    expect(first).toMatchObject({
      newSession: true,
      events: [{ type: 'pageview', path: '/' }],
    });
    expect(second).toMatchObject({
      newSession: false,
      events: [{ type: 'pageview', path: '/projects/demo' }],
    });
  });

  it('respects Do-Not-Track', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    trackPageview('/');
    vi.advanceTimersByTime(20_000);
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('keeps nothing in localStorage', () => {
    trackPageview('/');
    vi.advanceTimersByTime(2000);
    expect(localStorage.length).toBe(0);
  });

  it("never counts the admin's own visits", () => {
    localStorage.setItem('cb_exclude', '1');
    trackPageview('/');
    vi.advanceTimersByTime(20_000);
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('records outbound LinkedIn clicks immediately', async () => {
    trackPageview('/');
    const link = document.createElement('a');
    link.href = 'https://il.linkedin.com/in/coral-bareket-97b886216';
    document.body.appendChild(link);
    link.addEventListener('click', (e) => e.preventDefault());
    link.click();

    const batches = await sentBatches();
    expect(batches.flatMap((b) => b.events)).toContainEqual({ type: 'click', target: 'linkedin' });
    link.remove();
  });
});

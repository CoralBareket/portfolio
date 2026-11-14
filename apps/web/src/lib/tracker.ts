import type { AnalyticsEvent, EventBatch } from '@portfolio/shared';
import { ANALYTICS_EXCLUDE_KEY } from './site';

/**
 * First-party, privacy-friendly analytics (~1.5 KB).
 * - No visitor ID, no cookies, no IP, no fingerprinting: only a per-tab session flag
 *   in sessionStorage, which the browser forgets when the tab closes.
 * - Events are batched and sent with navigator.sendBeacon.
 * - Off for Do-Not-Track / Global Privacy Control, automation, the admin, and /admin.
 */

const ENDPOINT = '/api/events';
const FLUSH_MS = 15_000;
const KEYS = { session: 'cb_sid', sections: 'cb_sec' } as const;

type State = { queue: AnalyticsEvent[]; newSession: boolean; referrer: string; lastPath: string };

let state: State | null | undefined; // undefined = not initialised, null = disabled

const get = (store: Storage, key: string) => {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
};
const set = (store: Storage, key: string, value: string) => {
  try {
    store.setItem(key, value);
  } catch {
    /* storage blocked: tracking still works, just without memory */
  }
};

function isOptedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  const w = window as Window & { doNotTrack?: string };
  return (
    nav.doNotTrack === '1' ||
    w.doNotTrack === '1' ||
    nav.globalPrivacyControl === true ||
    nav.webdriver === true ||
    location.pathname.startsWith('/admin') ||
    get(localStorage, ANALYTICS_EXCLUDE_KEY) === '1'
  );
}

function init(): State | null {
  if (state !== undefined) return state;
  if (typeof window === 'undefined' || isOptedOut()) return (state = null);

  const newSession = !get(sessionStorage, KEYS.session);
  if (newSession) set(sessionStorage, KEYS.session, '1');

  state = {
    queue: [],
    newSession,
    referrer: newSession ? document.referrer.slice(0, 300) : '',
    lastPath: '',
  };

  document.addEventListener('click', onClick, { capture: true });
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
  window.addEventListener('pagehide', flush);
  window.setInterval(flush, FLUSH_MS);
  return state;
}

function flush(): void {
  const s = state;
  if (!s) return;
  if (s.queue.length === 0 && !s.newSession) return;

  const batch: EventBatch = { newSession: s.newSession, referrer: s.referrer, events: s.queue.splice(0, 30) };
  const body = JSON.stringify(batch);
  // The visit (and its source) is counted exactly once.
  s.newSession = false;
  s.referrer = '';

  const sent = navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }));
  if (!sent) void fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => undefined);
}

function onClick(e: MouseEvent): void {
  const link = (e.target as Element | null)?.closest?.('a');
  if (!link) return;
  const explicit = link.dataset.track;
  const href = link.getAttribute('href') ?? '';
  const target =
    explicit === 'cv' || explicit === 'repo' || explicit === 'demo'
      ? explicit
      : href.startsWith('mailto:')
        ? 'email'
        : /linkedin\.com/.test(href)
          ? 'linkedin'
          : /github\.com\/CoralBareket\/?$/i.test(href)
            ? 'github'
            : null;
  if (!target) return;
  state?.queue.push({ type: 'click', target });
  flush(); // the click may navigate away
}

/** Records a page view (call on every route change). */
export function trackPageview(path: string): void {
  const s = init();
  if (!s || s.lastPath === path) return;
  s.lastPath = path;
  s.queue.push({ type: 'pageview', path: path.slice(0, 200) });
  // Send the first page view quickly; later events ride on the periodic flush.
  window.setTimeout(flush, 1500);
}

/** Watches `section[id]` elements and records each section once per session. */
export function observeSections(root: ParentNode = document): () => void {
  const s = init();
  if (!s || typeof IntersectionObserver === 'undefined') return () => undefined;
  const seen = new Set((get(sessionStorage, KEYS.sections) ?? '').split(',').filter(Boolean));

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (!entry.isIntersecting || !id || seen.has(id)) continue;
        seen.add(id);
        set(sessionStorage, KEYS.sections, [...seen].join(','));
        s.queue.push({ type: 'section_view', section: id });
      }
    },
    { threshold: 0.35 },
  );
  root.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

/** Test helper: forget all state. */
export function __resetTracker(): void {
  state = undefined;
}

import type { EventBatch } from '@portfolio/shared';
import { classifyReferrer, normalizeUtm } from '../lib/referrer';
import { parseUserAgent } from '../lib/user-agent';
import { statsRepository, type StatIncrements } from '../repositories/stats.repository';

/** Only known site sections are counted, so arbitrary strings can't bloat the stats doc. */
const SECTIONS = new Set(['top', 'stack', 'focus', 'experience', 'projects', 'about', 'contact']);

/** Page paths are bucketed: "/", "/projects/<slug>", or "other". */
function pageKey(path: string): string {
  if (path === '/' || path === '') return '/';
  const project = /^\/projects\/([a-z0-9-]{1,80})\/?$/.exec(path);
  return project ? `/projects/${project[1]}` : 'other';
}

function israelHour(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', hourCycle: 'h23' })
    .format(date)
    .padStart(2, '0');
}

const bump = (map: Record<string, number>, key: string, by = 1) => {
  map[key] = (map[key] ?? 0) + by;
};

/**
 * Turns one tracker batch into the counter increments for today's stats doc.
 * Pure function: no I/O, fully unit-tested.
 */
export function buildIncrements(
  batch: EventBatch,
  ua: string,
  ownHost: string,
  now = new Date(),
): StatIncrements {
  const pages: Record<string, number> = {};
  const sections: Record<string, number> = {};
  const clicks: Record<string, number> = {};
  let pageviews = 0;

  for (const e of batch.events) {
    if (e.type === 'pageview') {
      pageviews++;
      bump(pages, pageKey(e.path));
    } else if (e.type === 'section_view') {
      if (SECTIONS.has(e.section)) bump(sections, e.section);
    } else {
      bump(clicks, e.target);
    }
  }

  const inc: StatIncrements = {};
  if (pageviews) {
    inc.pageviews = pageviews;
    inc.pages = pages;
    inc.hours = { [israelHour(now)]: pageviews };
  }
  if (Object.keys(sections).length) inc.sections = sections;
  if (Object.keys(clicks).length) inc.clicks = clicks;
  if (batch.firstVisitToday) inc.uniques = 1;
  if (batch.isNewVisitor) inc.newVisitors = 1;

  // Source and device are counted once per session, not per event.
  if (batch.newSession) {
    const client = parseUserAgent(ua);
    inc.sessions = 1;
    inc.referrers = { [classifyReferrer(batch.referrer, ownHost)]: 1 };
    const utm = normalizeUtm(batch.utmSource);
    if (utm) inc.utm = { [utm]: 1 };
    inc.devices = { [client.device]: 1 };
    inc.browsers = { [client.browser]: 1 };
    inc.os = { [client.os]: 1 };
  }
  return inc;
}

export const eventsService = {
  async ingest(batch: EventBatch, ua: string, ownHost: string): Promise<void> {
    const increments = buildIncrements(batch, ua, ownHost);
    if (Object.keys(increments).length === 0) return;
    await statsRepository.increment(increments);
  },
};

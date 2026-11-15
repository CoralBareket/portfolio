import type { EventBatch } from '@portfolio/shared';
import { classifyReferrer } from '../lib/referrer';
import { statsRepository, type StatIncrements } from '../repositories/stats.repository';

/** Only known site sections are counted, so arbitrary strings can't bloat the stats doc. */
const SECTIONS = new Set(['stack', 'focus', 'experience', 'projects', 'about', 'contact']);

const bump = (map: Record<string, number>, key: string, by = 1) => {
  map[key] = (map[key] ?? 0) + by;
};

/**
 * Turns one tracker batch into the counter increments for today's stats doc.
 * Pure function: no I/O, fully unit-tested.
 */
export function buildIncrements(batch: EventBatch, ownHost: string): StatIncrements {
  const sections: Record<string, number> = {};
  const clicks: Record<string, number> = {};
  let pageviews = 0;

  for (const e of batch.events) {
    if (e.type === 'pageview') pageviews++;
    else if (e.type === 'section_view') {
      if (SECTIONS.has(e.section)) bump(sections, e.section);
    } else bump(clicks, e.target);
  }

  const inc: StatIncrements = {};
  if (pageviews) inc.pageviews = pageviews;
  if (Object.keys(sections).length) inc.sections = sections;
  if (Object.keys(clicks).length) inc.clicks = clicks;

  // A visit and its traffic source are counted once per session, not per event.
  if (batch.newSession) {
    inc.sessions = 1;
    inc.referrers = { [classifyReferrer(batch.referrer, ownHost)]: 1 };
  }
  return inc;
}

export const eventsService = {
  async ingest(batch: EventBatch, ownHost: string): Promise<void> {
    const increments = buildIncrements(batch, ownHost);
    if (Object.keys(increments).length === 0) return;
    await statsRepository.increment(increments);
  },
};

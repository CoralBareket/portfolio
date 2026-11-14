import type { AnalyticsRange, AnalyticsSummary, AnalyticsTotals } from '@portfolio/shared';
import { israelDay } from '../lib/time';
import { statsRepository, type DailyStatsDoc } from '../repositories/stats.repository';

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<Exclude<AnalyticsRange, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };
const SECTION_ORDER = ['stack', 'focus', 'experience', 'projects', 'about', 'contact'];
const SECTION_NAMES: Record<string, string> = {
  stack: 'Tech Stack',
  focus: 'Engineering Focus',
  experience: 'Experience',
  projects: 'Projects',
  about: 'About',
  contact: 'Contact',
};
const TOTAL_KEYS = ['pageviews', 'uniques', 'sessions', 'newVisitors', 'cvDownloads', 'contacts'] as const;
const MAP_KEYS = ['pages', 'referrers', 'sections', 'clicks'] as const;

/** YYYY-MM-DD arithmetic on calendar days (UTC-based, so no DST surprises). */
export const addDays = (day: string, n: number) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS) + 1;

const num = (v: unknown) => (typeof v === 'number' ? v : 0);

function sumTotals(docs: DailyStatsDoc[]): AnalyticsTotals {
  const t = Object.fromEntries(TOTAL_KEYS.map((k) => [k, 0])) as AnalyticsTotals;
  for (const d of docs) for (const k of TOTAL_KEYS) t[k] += num(d[k]);
  return t;
}

function sumMap(docs: DailyStatsDoc[], key: string): [string, number][] {
  const out: Record<string, number> = {};
  for (const d of docs) {
    const m = d[key];
    if (m && typeof m === 'object') for (const [k, v] of Object.entries(m)) out[k] = (out[k] ?? 0) + num(v);
  }
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** Short, plain-language observations for the dashboard. */
export function buildInsights(s: Omit<AnalyticsSummary, 'insights'>, periodLabel: string): string[] {
  const out: string[] = [];
  const { totals, previous } = s;
  if (totals.pageviews === 0) return ['No visits recorded in this period yet.'];

  if (previous && previous.pageviews > 0) {
    const change = pct(totals.pageviews - previous.pageviews, previous.pageviews);
    const top = s.referrers[0];
    const via = top && top[0] !== 'Direct' ? `, mostly from ${top[0]}` : '';
    if (change !== 0)
      out.push(
        `Views ${change > 0 ? 'up' : 'down'} ${Math.abs(change)}% vs the previous ${periodLabel}${via}.`,
      );
    else out.push(`Views are flat vs the previous ${periodLabel}.`);
  }

  const topSource = s.referrers[0];
  if (topSource && totals.sessions > 0) {
    out.push(`${topSource[0]} brought ${pct(topSource[1], totals.sessions)}% of sessions.`);
  }

  const reach = new Map(s.sections);
  const base = Math.max(0, ...SECTION_ORDER.map((id) => reach.get(id) ?? 0));
  if (base > 0) {
    const dropAt = SECTION_ORDER.find((id) => (reach.get(id) ?? 0) / base < 0.5);
    if (dropAt) out.push(`Most visitors leave before the ${SECTION_NAMES[dropAt]} section.`);
    else out.push('Most visitors scroll all the way to Contact.');
  }

  if (totals.uniques > 0) {
    out.push(
      `${pct(totals.cvDownloads, totals.uniques)}% of visitors downloaded the CV and ${pct(totals.contacts, totals.uniques)}% sent a message.`,
    );
  }

  const peak = s.hours.reduce((best, v, h) => (v > (s.hours[best] ?? 0) ? h : best), 0);
  if ((s.hours[peak] ?? 0) > 0) {
    const hh = String(peak).padStart(2, '0');
    out.push(`Busiest hour: ${hh}:00–${String((peak + 1) % 24).padStart(2, '0')}:00 (Israel time).`);
  }

  return out.slice(0, 6);
}

/** Pure aggregation of daily docs into the dashboard payload. */
export function summarize(
  range: AnalyticsRange,
  current: DailyStatsDoc[],
  previous: DailyStatsDoc[] | null,
  from: string,
  to: string,
): AnalyticsSummary {
  const byDate = new Map(current.map((d) => [d.date, d]));
  const length = Math.min(daysBetween(from, to), 366);
  const daily = Array.from({ length }, (_, i) => {
    const date = addDays(to, i - length + 1);
    const d = byDate.get(date);
    return { date, pageviews: num(d?.pageviews), uniques: num(d?.uniques) };
  });

  const maps = Object.fromEntries(MAP_KEYS.map((k) => [k, sumMap(current, k)])) as Record<
    (typeof MAP_KEYS)[number],
    [string, number][]
  >;
  const hourMap = new Map(sumMap(current, 'hours'));
  const hours = Array.from({ length: 24 }, (_, h) => hourMap.get(String(h).padStart(2, '0')) ?? 0);

  const base = {
    range,
    from,
    to,
    totals: sumTotals(current),
    previous: previous ? sumTotals(previous) : null,
    daily,
    ...maps,
    hours,
  };
  const label = range === 'all' ? 'period' : `${RANGE_DAYS[range]} days`;
  return { ...base, insights: buildInsights(base, label) };
}

export const analyticsService = {
  async summary(range: AnalyticsRange, now = new Date()): Promise<AnalyticsSummary> {
    const to = israelDay(now);
    if (range === 'all') {
      const docs = await statsRepository.listRange('2000-01-01', to);
      const first = docs.map((d) => d.date).sort()[0] ?? to;
      return summarize(range, docs, null, first, to);
    }
    const days = RANGE_DAYS[range];
    const from = addDays(to, -(days - 1));
    const [current, previous] = await Promise.all([
      statsRepository.listRange(from, to),
      statsRepository.listRange(addDays(from, -days), addDays(from, -1)),
    ]);
    return summarize(range, current, previous, from, to);
  },

  /** One CSV row per recorded day in the range (a single Firestore query). */
  async csv(range: AnalyticsRange, now = new Date()): Promise<string> {
    const to = israelDay(now);
    const from = range === 'all' ? '2000-01-01' : addDays(to, -(RANGE_DAYS[range] - 1));
    const docs = (await statsRepository.listRange(from, to)).sort((a, b) => a.date.localeCompare(b.date));
    const header = ['date', ...TOTAL_KEYS].join(',');
    const rows = docs.map((d) => [d.date, ...TOTAL_KEYS.map((k) => num(d[k]))].join(','));
    return [header, ...rows].join('\n') + '\n';
  },
};

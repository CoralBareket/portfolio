import type { AnalyticsRange, AnalyticsSummary, AnalyticsTotals } from '@portfolio/shared';
import { israelDay } from '../lib/time';
import { statsRepository, type DailyStatsDoc } from '../repositories/stats.repository';

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<Exclude<AnalyticsRange, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };
const SECTION_ORDER = ['stack', 'focus', 'experience', 'projects', 'about', 'contact'];
const SECTION_NAMES: Record<string, string> = {
  stack: 'Tech Stack',
  focus: 'Range',
  experience: 'Experience',
  projects: 'Projects',
  about: 'About',
  contact: 'Contact',
};
const TOTAL_KEYS = ['pageviews', 'sessions', 'cvDownloads', 'contacts'] as const;
const MAP_KEYS = ['referrers', 'sections', 'clicks'] as const;

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
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Short, plain-language observations for the dashboard. */
export function buildInsights(s: Omit<AnalyticsSummary, 'insights'>): string[] {
  const { totals } = s;
  if (totals.pageviews === 0) return ['No visits recorded in this period yet.'];
  const out: string[] = [];

  const topSource = s.referrers[0];
  if (topSource && totals.sessions > 0) {
    out.push(`${topSource[0]} brought ${pct(topSource[1], totals.sessions)}% of visits.`);
  }

  const reach = new Map(s.sections);
  const base = Math.max(0, ...SECTION_ORDER.map((id) => reach.get(id) ?? 0));
  if (base > 0) {
    const dropAt = SECTION_ORDER.find((id) => (reach.get(id) ?? 0) / base < 0.5);
    out.push(
      dropAt
        ? `Most visitors leave before the ${SECTION_NAMES[dropAt]} section.`
        : 'Most visitors scroll all the way to Contact.',
    );
  }

  out.push(
    `${plural(totals.cvDownloads, 'CV download')} and ${plural(totals.contacts, 'message')} in this period.`,
  );
  return out;
}

/** Pure aggregation of daily docs into the dashboard payload. */
export function summarize(
  range: AnalyticsRange,
  docs: DailyStatsDoc[],
  from: string,
  to: string,
): AnalyticsSummary {
  const byDate = new Map(docs.map((d) => [d.date, d]));
  const length = Math.min(daysBetween(from, to), 366);
  const daily = Array.from({ length }, (_, i) => {
    const date = addDays(to, i - length + 1);
    return { date, pageviews: num(byDate.get(date)?.pageviews) };
  });
  const maps = Object.fromEntries(MAP_KEYS.map((k) => [k, sumMap(docs, k)])) as Record<
    (typeof MAP_KEYS)[number],
    [string, number][]
  >;
  const base = { range, from, to, totals: sumTotals(docs), daily, ...maps };
  return { ...base, insights: buildInsights(base) };
}

function bounds(range: AnalyticsRange, now: Date): { from: string; to: string } {
  const to = israelDay(now);
  return { from: range === 'all' ? '2000-01-01' : addDays(to, -(RANGE_DAYS[range] - 1)), to };
}

export const analyticsService = {
  /** One query over small daily docs: a 90-day view reads at most 90 documents. */
  async summary(range: AnalyticsRange, now = new Date()): Promise<AnalyticsSummary> {
    const { from, to } = bounds(range, now);
    const docs = await statsRepository.listRange(from, to);
    const first = range === 'all' ? (docs.map((d) => d.date).sort()[0] ?? to) : from;
    return summarize(range, docs, first, to);
  },

  /** One CSV row per recorded day in the range. */
  async csv(range: AnalyticsRange, now = new Date()): Promise<string> {
    const { from, to } = bounds(range, now);
    const docs = (await statsRepository.listRange(from, to)).sort((a, b) => a.date.localeCompare(b.date));
    const cols = ['pageviews', 'cvDownloads', 'contacts'] as const;
    const rows = docs.map((d) => [d.date, ...cols.map((k) => num(d[k]))].join(','));
    return [['date', ...cols].join(','), ...rows].join('\n') + '\n';
  },
};

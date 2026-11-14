import type { User } from 'firebase/auth';
import { ArrowDownRight, ArrowUpRight, Download, Lightbulb, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsRange, AnalyticsSummary, AnalyticsTotals } from '@portfolio/shared';
import { adminFetch, describeError } from './api';
import { Button, Card, Notice } from './ui';

/** Chart colors validated (lightness band, CVD separation, contrast) on the dark card surface. */
const SERIES = { pageviews: '#D97706', uniques: '#3B82F6' } as const;
const AXIS = '#A89F91';
const GRID = '#2A251D';

const RANGES: { id: AnalyticsRange; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

const SECTION_LABELS: Record<string, string> = {
  stack: 'Tech Stack',
  focus: 'Engineering Focus',
  experience: 'Experience',
  projects: 'Projects',
  about: 'About',
  contact: 'Contact',
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);
const NICE_NAMES: Record<string, string> = {
  mobile: 'Phone',
  desktop: 'Desktop',
  tablet: 'Tablet',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  email: 'Email',
  cv: 'CV download',
  repo: 'Project repo',
  demo: 'Project demo',
};
const nice = (rows: [string, number][]) => rows.map(([k, v]) => [NICE_NAMES[k] ?? k, v] as [string, number]);

const fmt = (n: number) => n.toLocaleString('en-US');
const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : '–');
const shortDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function Analytics({ user }: { user: User }) {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminFetch<AnalyticsSummary>(user, `/analytics?range=${range}`)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(describeError(err)));
    return () => {
      cancelled = true;
    };
  }, [user, range]);

  const exportCsv = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/analytics.csv?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement('a'), { href: url, download: `analytics-${range}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters: one row above the charts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Date range" className="flex rounded-lg border border-border p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className={`rounded-md px-3 py-1.5 text-sm ${range === r.id ? 'bg-accent-soft text-accent' : 'text-muted hover:text-text'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={exportCsv}>
          <Download size={15} aria-hidden="true" /> Export CSV
        </Button>
      </div>

      {error && <Notice kind="error">{error}</Notice>}
      {!data && !error && <p className="text-sm text-muted">Loading analytics…</p>}
      {data && <Dashboard data={data} />}
    </div>
  );
}

function Dashboard({ data }: { data: AnalyticsSummary }) {
  const { totals, previous } = data;
  const returning = Math.max(0, totals.uniques - totals.newVisitors);
  const sectionReach = SECTION_ORDER.map((id) => [
    SECTION_LABELS[id] ?? id,
    new Map(data.sections).get(id) ?? 0,
  ]) as [string, number][];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Page views" field="pageviews" totals={totals} previous={previous} />
        <Kpi label="Unique visitors" field="uniques" totals={totals} previous={previous} />
        <Kpi label="Sessions" field="sessions" totals={totals} previous={previous} />
        <Kpi label="CV downloads" field="cvDownloads" totals={totals} previous={previous} />
        <Kpi label="Messages" field="contacts" totals={totals} previous={previous} />
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">New vs returning</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {fmt(totals.newVisitors)}{' '}
            <span className="text-base font-normal text-muted">/ {fmt(returning)}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card title="Visits per day">
          <DailyChart daily={data.daily} />
        </Card>
        <Card title="Insights">
          <ul className="space-y-3 text-sm">
            {data.insights.map((text) => (
              <li key={text} className="flex gap-2">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <p className="text-xs text-muted">Visitor → CV download</p>
              <p className="text-xl font-bold tabular-nums">{pct(totals.cvDownloads, totals.uniques)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Visitor → message</p>
              <p className="text-xl font-bold tabular-nums">{pct(totals.contacts, totals.uniques)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Sources">
          <BarList rows={data.referrers} total={totals.sessions} unit="sessions" />
        </Card>
        <Card title="UTM campaigns">
          <BarList
            rows={data.utm}
            total={totals.sessions}
            unit="sessions"
            empty="No utm_source links used yet."
          />
        </Card>
        <Card title="Section reach">
          <BarList rows={sectionReach} total={totals.sessions} unit="sessions" keepOrder />
        </Card>
        <Card title="Top pages">
          <BarList rows={data.pages} total={totals.pageviews} unit="views" />
        </Card>
        <Card title="Link clicks">
          <BarList rows={nice(data.clicks)} unit="clicks" empty="No tracked link clicks yet." />
        </Card>
        <Card title="Devices">
          <BarList rows={nice(data.devices)} total={totals.sessions} unit="sessions" />
        </Card>
        <Card title="Browsers">
          <BarList rows={data.browsers} total={totals.sessions} unit="sessions" />
        </Card>
        <Card title="Operating systems">
          <BarList rows={data.os} total={totals.sessions} unit="sessions" />
        </Card>
        <Card title="Busiest hours (Israel time)">
          <HoursChart hours={data.hours} />
        </Card>
      </div>
    </>
  );
}

function Kpi({
  label,
  field,
  totals,
  previous,
}: {
  label: string;
  field: keyof AnalyticsTotals;
  totals: AnalyticsTotals;
  previous: AnalyticsTotals | null;
}) {
  const now = totals[field];
  const before = previous?.[field];
  let delta: React.ReactNode = null;
  if (before !== undefined) {
    const change = before > 0 ? Math.round(((now - before) / before) * 100) : null;
    const Icon = change === null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
    const text = change === null ? (now > 0 ? 'new' : 'no change') : `${change > 0 ? '+' : ''}${change}%`;
    delta = (
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
        <Icon size={13} aria-hidden="true" /> {text} vs previous
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{fmt(now)}</p>
      {delta}
    </div>
  );
}

/** Horizontal bars with the value and share written next to them (never color alone). */
function BarList({
  rows,
  total,
  unit,
  empty = 'No data yet.',
  keepOrder = false,
}: {
  rows: [string, number][];
  total?: number;
  unit: string;
  empty?: string;
  keepOrder?: boolean;
}) {
  const visible = (keepOrder ? rows : rows.slice(0, 8)).filter(([, v]) => keepOrder || v > 0);
  if (visible.length === 0 || visible.every(([, v]) => v === 0))
    return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...visible.map(([, v]) => v), 1);
  return (
    <ul className="space-y-2.5">
      {visible.map(([name, value]) => (
        <li key={name} className="text-sm" title={`${name}: ${fmt(value)} ${unit}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate">{name}</span>
            <span className="shrink-0 tabular-nums text-muted">
              {fmt(value)}
              {total ? <span className="ml-1.5 text-xs">({pct(value, total)})</span> : null}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-bg" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{ width: `${(value / max) * 100}%`, backgroundColor: SERIES.pageviews }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const tooltipStyle = {
  contentStyle: { background: '#0E0C0A', border: `1px solid ${GRID}`, borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#F2EDE4' },
  itemStyle: { color: '#F2EDE4' },
};

function DailyChart({ daily }: { daily: AnalyticsSummary['daily'] }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              stroke={AXIS}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              stroke={AXIS}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={(d) => shortDate(String(d))}
              cursor={{ stroke: AXIS }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => <span style={{ color: '#F2EDE4' }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="pageviews"
              name="Page views"
              stroke={SERIES.pageviews}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="uniques"
              name="Unique visitors"
              stroke={SERIES.uniques}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button
        type="button"
        className="mt-2 text-xs text-muted underline"
        onClick={() => setShowTable((s) => !s)}
      >
        {showTable ? 'Hide table' : 'Show as table'}
      </button>
      {showTable && (
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="text-muted">
              <tr>
                <th className="py-1 font-medium">Date</th>
                <th className="py-1 font-medium">Page views</th>
                <th className="py-1 font-medium">Unique visitors</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-t border-border">
                  <td className="py-1">{d.date}</td>
                  <td className="py-1">{d.pageviews}</td>
                  <td className="py-1">{d.uniques}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HoursChart({ hours }: { hours: number[] }) {
  if (hours.every((h) => h === 0)) return <p className="text-sm text-muted">No data yet.</p>;
  const data = hours.map((views, hour) => ({ hour: String(hour).padStart(2, '0'), views }));
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -24 }} barCategoryGap={2}>
          <XAxis
            dataKey="hour"
            stroke={AXIS}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            allowDecimals={false}
            stroke={AXIS}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(h) => `${String(h)}:00–${String((Number(h) + 1) % 24).padStart(2, '0')}:00`}
            cursor={{ fill: 'rgb(245 165 36 / 0.08)' }}
          />
          <Bar dataKey="views" name="Page views" fill={SERIES.pageviews} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

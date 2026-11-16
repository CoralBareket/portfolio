import type { User } from 'firebase/auth';
import { Download, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AnalyticsRange, AnalyticsSummary } from '@portfolio/shared';
import { adminFetch, describeError } from './api';
import { Button, Card, Notice } from './ui';

/** Single-series blue (the site accent) on the dark card surface. */
const SERIES = '#6AA8FF';
const AXIS = '#959FAC';
const GRID = '#1E242E';

const RANGES: { id: AnalyticsRange; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

const SECTION_LABELS: Record<string, string> = {
  stack: 'Tech Stack',
  focus: 'Range',
  experience: 'Experience',
  projects: 'Projects',
  about: 'About',
  contact: 'Contact',
};
const CLICK_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  email: 'Email',
  cv: 'CV download',
  repo: 'Project repo',
  demo: 'Project demo',
};

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
  const { totals } = data;
  const reach = new Map(data.sections);
  const sectionReach = Object.entries(SECTION_LABELS).map(
    ([id, label]) => [label, reach.get(id) ?? 0] as [string, number],
  );
  const clicks = data.clicks.map(([k, v]) => [CLICK_LABELS[k] ?? k, v] as [string, number]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Page views" value={totals.pageviews} />
        <Kpi label="CV downloads" value={totals.cvDownloads} />
        <Kpi label="Messages" value={totals.contacts} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card title="Page views per day">
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
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Sources">
          <BarList rows={data.referrers} total={totals.sessions} />
        </Card>
        <Card title="Section reach">
          <BarList rows={sectionReach} total={totals.sessions} keepOrder />
        </Card>
        <Card title="Link clicks">
          <BarList rows={clicks} empty="No tracked link clicks yet." />
        </Card>
      </div>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{fmt(value)}</p>
    </div>
  );
}

/** Horizontal bars with the value (and share of visits) written beside them, never color alone. */
function BarList({
  rows,
  total,
  empty = 'No data yet.',
  keepOrder = false,
}: {
  rows: [string, number][];
  total?: number;
  empty?: string;
  keepOrder?: boolean;
}) {
  const visible = keepOrder ? rows : rows.filter(([, v]) => v > 0).slice(0, 8);
  if (visible.every(([, v]) => v === 0)) return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...visible.map(([, v]) => v), 1);
  return (
    <ul className="space-y-2.5">
      {visible.map(([name, value]) => (
        <li key={name} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate">{name}</span>
            <span className="shrink-0 tabular-nums text-muted">
              {fmt(value)}
              {total ? <span className="ml-1.5 text-xs">({pct(value, total)} of visits)</span> : null}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-bg" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{ width: `${(value / max) * 100}%`, backgroundColor: SERIES }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

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
              contentStyle={{
                background: '#080A0E',
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#F0F4F8' }}
              itemStyle={{ color: '#F0F4F8' }}
              labelFormatter={(d) => shortDate(String(d))}
              cursor={{ stroke: AXIS }}
            />
            <Line
              type="monotone"
              dataKey="pageviews"
              name="Page views"
              stroke={SERIES}
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
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-t border-border">
                  <td className="py-1">{d.date}</td>
                  <td className="py-1">{d.pageviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

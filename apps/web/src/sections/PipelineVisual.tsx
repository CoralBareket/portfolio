import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Hero visual: the shape of the work, as four floating cards wired into a pipeline.
 * API (NestJS) → query (ClickHouse/PostgreSQL) → async job (AWS Batch) → dashboard (React).
 * Decorative only, so it is hidden from screen readers; the same story is told in text below.
 */

type CardProps = { file: string; tag: string; index: number; className?: string; children: ReactNode };

function Card({ file, tag, index, className = '', children }: CardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`relative rounded-xl border border-border bg-surface/90 shadow-[0_8px_40px_-12px_rgb(0_0_0/0.6)] backdrop-blur ${className}`}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: [0, -6, 0] }}
      transition={
        reduce
          ? undefined
          : {
              opacity: { duration: 0.5, delay: 0.25 + index * 0.18 },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.7 },
            }
      }
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="ml-1.5 font-mono text-[11px] text-muted">{file}</span>
        </span>
        <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent">{tag}</span>
      </div>
      <div className="px-3 py-2.5 font-mono text-[11px] leading-relaxed sm:text-xs">{children}</div>
    </motion.div>
  );
}

const k = 'text-accent'; // keyword
const s = 'text-[#c9b48f]'; // string
const c = 'text-muted'; // comment / punctuation

function Connector() {
  return (
    <svg className="mx-auto block h-7 w-4 text-accent/70" viewBox="0 0 16 28" aria-hidden="true">
      <line
        x1="8"
        y1="0"
        x2="8"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        className="animate-dash"
      />
      <path d="M3 20l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MiniChart() {
  const bars = [38, 52, 44, 63, 58, 72, 66, 84];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted">run_metrics</span>
        <span className="flex items-center gap-1 text-accent">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" /> live
        </span>
      </div>
      <div className="flex h-14 items-end gap-1.5">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-accent/30 to-accent"
            initial={{ height: '10%' }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.8, delay: 1 + i * 0.06, ease: 'easeOut' }}
          />
        ))}
      </div>
    </div>
  );
}

export function PipelineVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none">
      <Card file="runs.controller.ts" tag="NestJS" index={0} className="mr-8">
        <p className={c}>@Post(&apos;runs&apos;)</p>
        <p>
          <span className={k}>async</span> startRun(<span className={c}>@Body()</span> dto: StartRunDto) {'{'}
        </p>
        <p className="pl-4">
          <span className={k}>return this</span>.runs.enqueue(dto);
        </p>
        <p>{'}'}</p>
      </Card>
      <Connector />
      <Card file="results.sql" tag="ClickHouse" index={1} className="ml-8">
        <p>
          <span className={k}>SELECT</span> run_id, avg(score)
        </p>
        <p>
          <span className={k}>FROM</span> ml_results
        </p>
        <p>
          <span className={k}>WHERE</span> ts &gt; now() - <span className={k}>INTERVAL</span> 1 DAY
        </p>
        <p>
          <span className={k}>GROUP BY</span> run_id
        </p>
      </Card>
      <Connector />
      <Card file="batch-job.json" tag="AWS Batch" index={2} className="mr-8">
        <p>
          {'{ '}
          <span className={s}>&quot;jobQueue&quot;</span>: <span className={s}>&quot;ml-runs&quot;</span>,
        </p>
        <p className="pl-2">
          <span className={s}>&quot;status&quot;</span>: <span className={k}>&quot;RUNNING&quot;</span>
          {' }'}
        </p>
      </Card>
      <Connector />
      <Card file="Dashboard.tsx" tag="React" index={3} className="ml-8">
        <MiniChart />
      </Card>
    </div>
  );
}

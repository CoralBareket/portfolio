import { Database, Terminal } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Hero visual: a small "world" of floating code panes from the stack I work in (a NestJS
 * controller, a React dashboard, an API call, a terminal, a ClickHouse query), drifting slowly
 * over a faint grid with orbit rings and twinkling particles. Purely decorative.
 */

/** Gentle back-and-forth drift; nothing at all for reduced motion. */
function Drift({
  dx,
  dy,
  duration,
  className,
  children,
}: {
  dx: number;
  dy: number;
  duration: number;
  className: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`world-pane ${className}`}
      animate={reduce ? undefined : { x: [0, dx, 0], y: [0, dy, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function PaneHeader({ file }: { file: string }) {
  return (
    <header className="flex h-7 items-center gap-1.5 border-b border-accent/15 px-3 text-[10px] text-faint">
      <i className="size-1.5 rounded-full bg-accent/50" />
      <i className="size-1.5 rounded-full bg-teal/50" />
      <i className="size-1.5 rounded-full bg-rule" />
      <span className="ml-1.5">{file}</span>
    </header>
  );
}

/* Syntax colours: keyword, string/function, comment. */
const K = ({ children }: { children: ReactNode }) => <span className="text-[#b9a4ff]">{children}</span>;
const F = ({ children }: { children: ReactNode }) => <span className="text-accent">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-teal">{children}</span>;

const PARTICLES = [
  [18, 8],
  [72, 15],
  [8, 26],
  [46, 34],
  [80, 44],
  [25, 52],
  [61, 58],
  [13, 67],
  [76, 74],
  [91, 39],
  [20, 91],
  [39, 14],
] as const;

export function CodeWorld() {
  return (
    <motion.div
      aria-hidden="true"
      className="code-world relative mx-auto aspect-[0.95] w-full max-w-[640px] sm:aspect-[1.3]"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <div className="glow absolute inset-[6%]" />
      <div className="world-orbit inset-[14%_6%_16%_10%] -rotate-12" />
      <div className="world-orbit world-orbit-slow inset-[26%_16%_6%_4%] rotate-[20deg]" />

      <span className="world-fragment top-[34%] right-[11%] hidden text-accent/50 sm:block">{'{ }'}</span>
      <span className="world-fragment top-[60%] left-[3%] hidden text-[#b9a4ff]/40 sm:block">{'</>'}</span>

      <div className="absolute inset-0">
        {PARTICLES.map(([left, top], i) => (
          <i
            key={i}
            className={`world-particle ${i > 7 ? 'hidden sm:block' : ''}`}
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${(i * 0.45) % 3}s` }}
          />
        ))}
      </div>

      <Drift dx={6} dy={-7} duration={9} className="top-[5%] left-[3%] w-[80%] sm:top-[17%] sm:w-[300px]">
        <PaneHeader file="runs.controller.ts" />
        <code className="world-code">
          <F>@Post</F>(<S>&apos;runs&apos;</S>)
          <br />
          <K>async</K> start(<F>@Body</F>() dto: StartRunDto) {'{'}
          <br />
          &nbsp;&nbsp;<K>return</K> <K>this</K>.runs.<F>enqueue</F>(dto);
          <br />
          {'}'}
        </code>
      </Drift>

      <Drift dx={-5} dy={6} duration={10} className="top-[3%] right-[7%] hidden w-[230px] sm:block">
        <PaneHeader file="Dashboard.tsx" />
        <code className="world-code">
          <K>const</K> {'{ data }'} = <F>useLiveRuns</F>();
          <br />
          <K>return</K> <S>&lt;RunsChart</S> data={'{data}'} <S>/&gt;</S>;
        </code>
      </Drift>

      <Drift
        dx={5}
        dy={4}
        duration={8}
        className="top-[42%] right-[3%] w-[62%] p-3 sm:top-[47%] sm:right-[7%] sm:w-[235px]"
      >
        <p className="flex items-center gap-2 text-[11px]">
          <span className="bg-teal/15 px-1.5 py-0.5 text-[10px] text-teal">POST</span>
          <span className="text-text/80">/api/runs</span>
          <span className="ml-auto text-[10px] text-teal">201</span>
        </p>
        <p className="mt-2.5 border-t border-accent/15 pt-2 text-[11px] text-muted">
          <K>{'{'}</K> &quot;status&quot;: <S>&quot;queued&quot;</S> <K>{'}'}</K>
        </p>
      </Drift>

      <Drift
        dx={-4}
        dy={-5}
        duration={11}
        className="bottom-[4%] left-[5%] flex w-[74%] gap-3 p-3 sm:bottom-[5%] sm:left-[8%] sm:w-[300px]"
      >
        <Terminal size={14} className="mt-0.5 shrink-0 text-accent" />
        <code className="text-[11px] leading-[1.9] text-muted">
          <S>$</S> docker build -t api .
          <br />
          <S>$</S> aws batch submit-job
          <br />
          <S>$</S> git push origin main
          <i className="ml-1 inline-block h-3 w-1.5 animate-blink bg-teal align-middle" />
        </code>
      </Drift>

      <Drift dx={5} dy={-4} duration={9.5} className="right-[12%] bottom-[2%] hidden w-[205px] p-3 sm:block">
        <p className="flex items-center gap-2 text-[11px] text-text/80">
          <Database size={14} className="text-accent" /> ClickHouse
        </p>
        <code className="mt-2 block text-[10px] text-muted">
          <K>SELECT</K> avg(pnl) <K>FROM</K> runs
        </code>
        <small className="mt-1 block text-[10px] text-[#b9a4ff]">ML analytics query</small>
      </Drift>
    </motion.div>
  );
}

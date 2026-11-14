/**
 * Fig. 1: the shape of the work, drawn like a system schematic.
 * One amber signal travels API → Jobs → Storage → Analytics → Dashboard, and each node
 * lights as it passes. Horizontal on wide screens, vertical on phones. Decorative, so the
 * full description is given as text for screen readers.
 */

const NODES = [
  { title: 'API', tech: 'NestJS · REST', note: 'run orchestration' },
  { title: 'Jobs', tech: 'AWS Batch', note: 'async processing' },
  { title: 'Storage', tech: 'PostgreSQL', note: 'TypeORM' },
  { title: 'Analytics', tech: 'ClickHouse', note: 'ML data pipelines' },
  { title: 'Dashboard', tech: 'React', note: 'real-time monitoring' },
] as const;

/** Must match the 7s cycle of the schematic animations in styles/index.css. */
const CYCLE_S = 7;

export function Schematic() {
  return (
    <figure className="relative">
      <p className="sr-only">
        Diagram of the systems I work on: a NestJS REST API that orchestrates runs, AWS Batch for async jobs,
        PostgreSQL storage, ClickHouse analytics for ML data, and React dashboards for real-time monitoring.
      </p>

      <div aria-hidden="true" className="relative">
        {/* The wire: horizontal on md+, vertical on phones, with the travelling signal. */}
        <div className="absolute top-0 bottom-0 left-[11px] w-px overflow-hidden bg-rule md:top-[34px] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto">
          <span className="schematic-signal-y absolute inset-0 motion-reduce:hidden md:hidden">
            <span className="absolute top-0 left-[-3px] size-[7px] rounded-full bg-accent shadow-[0_0_12px_2px_rgb(245_165_36/0.55)]" />
          </span>
          <span className="schematic-signal-x absolute inset-0 hidden motion-reduce:hidden md:block">
            <span className="absolute top-[-3px] left-0 size-[7px] rounded-full bg-accent shadow-[0_0_12px_2px_rgb(245_165_36/0.55)]" />
          </span>
        </div>

        <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-4">
          {NODES.map((n, i) => (
            <li key={n.title} className="relative pl-9 md:pl-0">
              {/* Node marker sitting on the wire */}
              <span
                className="schematic-node absolute top-[27px] left-[6px] block size-[11px] border border-rule bg-bg md:static md:mt-[29px] md:mb-5"
                style={{ animationDelay: `${(i / NODES.length + 0.02) * CYCLE_S - CYCLE_S}s` }}
              />
              <p className="font-mono text-[10px] tracking-[0.14em] text-faint">N.0{i + 1}</p>
              <p className="mt-1 text-lg font-medium tracking-tight">{n.title}</p>
              <p className="font-mono text-[12px] text-muted">{n.tech}</p>
              <p className="mt-1 font-serif text-[17px] text-muted italic">{n.note}</p>
            </li>
          ))}
        </ol>

        {/* Annotation, like a margin note on a drawing */}
        <p className="mt-6 hidden font-mono text-[10px] tracking-[0.14em] text-faint md:block">
          ← EVENTS VIA WEBHOOKS + EVENTBRIDGE · DEPLOYED WITH DOCKER ON AWS EC2 · CI/CD →
        </p>
      </div>
    </figure>
  );
}

import type { Project } from '@portfolio/shared';

/** Ordered architecture steps drawn as a flow: horizontal on wide screens, vertical on phones. */
export function ArchitectureFlow({ steps }: { steps: Project['architecture'] }) {
  if (steps.length === 0) return null;
  return (
    <ol
      className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center"
      aria-label="Architecture flow"
    >
      {steps.map((s, i) => (
        <li key={`${s.step}-${i}`} className="flex flex-col items-center gap-2 lg:flex-1 lg:flex-row">
          <div className="w-full rounded-xl border border-border bg-surface p-4 text-center">
            <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</p>
            <p className="mt-1 font-semibold">{s.step}</p>
            {s.detail && <p className="mt-1 text-sm text-muted">{s.detail}</p>}
          </div>
          {i < steps.length - 1 && (
            <span aria-hidden="true" className="font-mono text-accent lg:px-1">
              <span className="lg:hidden">↓</span>
              <span className="hidden lg:inline">→</span>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

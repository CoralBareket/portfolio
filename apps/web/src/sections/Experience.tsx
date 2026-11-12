import { TrendingUp } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { useContent } from '../lib/content';

export function Experience() {
  const { content } = useContent();
  return (
    <ol className="relative border-l border-border pl-6 sm:pl-10">
      {content.experience.map((job) => (
        <li key={`${job.company}-${job.period}`} className="relative pb-4">
          <span
            aria-hidden="true"
            className="absolute top-2 -left-[31px] size-3 rounded-full bg-accent shadow-[0_0_0_4px_var(--color-bg),0_0_16px_var(--color-accent)] sm:-left-[47px]"
          />
          <Reveal>
            <article className="rounded-xl border border-border bg-surface p-6 sm:p-8">
              <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <div>
                  <h3 className="text-xl font-semibold">
                    {job.role} <span className="text-accent">@ {job.company}</span>
                  </h3>
                  {job.companyDescription && (
                    <p className="mt-1 text-sm text-muted">{job.companyDescription}</p>
                  )}
                </div>
                <p className="font-mono text-sm text-muted">{job.period}</p>
              </header>

              {job.highlight && (
                <div className="mt-6 flex items-start gap-3 rounded-lg border border-accent/40 bg-accent-soft p-4">
                  <TrendingUp size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-xs tracking-wide text-accent uppercase">
                      Intern <span aria-hidden="true">→</span>
                      <span className="sr-only">to</span> Full-time
                    </p>
                    <p className="mt-1 text-sm">{job.highlight}</p>
                  </div>
                </div>
              )}

              <ul className="mt-6 space-y-3">
                {job.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-muted">
                    <span aria-hidden="true" className="mt-0.5 font-mono text-accent">
                      ▹
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

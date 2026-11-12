import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Props = { id: string; number: string; slug: string; title: string; intro?: string; children: ReactNode };

/** Numbered section shell: `01 // tech_stack` label, heading, optional intro. */
export function Section({ id, number, slug, title, intro, children }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28"
    >
      <Reveal>
        <p className="font-mono text-sm text-accent">
          {number} <span className="text-muted">//</span> {slug}
        </p>
        <h2 id={`${id}-title`} className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {intro && <p className="mt-4 max-w-2xl text-muted">{intro}</p>}
      </Reveal>
      <div className="mt-12">{children}</div>
    </section>
  );
}

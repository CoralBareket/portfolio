import type { ReactNode } from 'react';
import { Reveal, Rule } from './Reveal';

type Props = {
  id: string;
  number: string;
  label: string;
  title: string;
  intro?: string;
  children: ReactNode;
};

/**
 * Spec-sheet section: a hairline, then a margin column (number, label, title — sticky on
 * wide screens) beside the content, like a well-typeset technical document.
 */
export function Section({ id, number, label, title, intro, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto max-w-[1200px] px-5 sm:px-8">
      <Rule />
      <div className="grid grid-cols-1 gap-10 pt-8 pb-24 sm:pt-10 sm:pb-32 lg:grid-cols-12 lg:gap-8">
        <header className="lg:sticky lg:top-24 lg:col-span-3 lg:self-start">
          <p className="label">
            <span className="text-accent">{number}</span>
            <span className="mx-2 text-faint">/</span>
            {label}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-5 font-serif text-[2.6rem] leading-[1.02] tracking-[-0.01em] sm:text-5xl"
          >
            {title}
          </h2>
          {intro && <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted">{intro}</p>}
        </header>
        <Reveal className="lg:col-span-9">{children}</Reveal>
      </div>
    </section>
  );
}

import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Props = {
  id: string;
  number: string;
  title: string;
  /** Centred heading over a soft glow, for the closing call to action. */
  centered?: boolean;
  children: ReactNode;
};

/** A numbered section: a hairline on top, the index in blue beside a large heading, then content. */
export function Section({ id, number, title, centered = false, children }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative isolate overflow-hidden border-t border-border ${centered ? 'bg-surface/40' : ''}`}
    >
      {centered && (
        <div
          aria-hidden="true"
          className="glow pointer-events-none absolute top-[-280px] left-1/2 -z-10 size-[640px] -translate-x-1/2"
        />
      )}
      <div className="container-page py-20 sm:py-28">
        {centered ? (
          <header className="mb-12 text-center sm:mb-14">
            <p className="font-mono text-[11px] tracking-[0.12em] text-accent">{number}</p>
            <h2
              id={`${id}-title`}
              className="mt-5 text-[clamp(2.75rem,7vw,5rem)] leading-none font-semibold tracking-[-0.05em]"
            >
              {title}
            </h2>
          </header>
        ) : (
          <header className="mb-10 grid grid-cols-[40px_1fr] sm:mb-14 sm:grid-cols-[68px_1fr]">
            <p className="pt-3 font-mono text-[11px] text-accent">{number}</p>
            <h2
              id={`${id}-title`}
              className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.04em]"
            >
              {title}
            </h2>
          </header>
        )}
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}

import { ArrowDown, ArrowDownRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useContent } from '../lib/content';
import { CodeWorld } from './CodeWorld';

const ease = [0.2, 0.7, 0.2, 1] as const;

export function Hero({ workHref }: { workHref: string }) {
  const { content, cvAvailable } = useContent();
  const { hero } = content;
  const [first, ...rest] = hero.name.split(' ');

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute top-10 right-[-120px] -z-10 size-[760px]"
      />
      <div className="container-page grid grid-cols-1 items-center gap-14 pt-32 pb-20 sm:pt-36 sm:pb-28 lg:min-h-[min(900px,100svh)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div>
          <p className="font-mono text-[12px] tracking-[0.12em] text-muted uppercase">Hello, I&apos;m</p>
          <h1
            id="hero-title"
            className="mt-3 text-[clamp(3.25rem,7.2vw,6.5rem)] leading-[0.94] font-semibold tracking-[-0.06em]"
          >
            <span className="block">{first}</span> <span className="block">{rest.join(' ')}</span>
          </h1>
          <p className="mt-6 text-[clamp(1.2rem,2vw,1.6rem)] font-medium tracking-[-0.02em] text-accent">
            {hero.title}
          </p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="mt-4 max-w-[36ch] text-[clamp(1.1rem,1.6vw,1.3rem)] leading-relaxed text-muted"
          >
            {hero.tagline}
          </motion.p>

          <ul className="mt-7 flex max-w-xl flex-wrap gap-2" aria-label="Main technologies">
            {hero.chips.map((chip) => (
              <li key={chip} className="chip">
                {chip}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a href={workHref} className="btn btn-primary group">
              Explore my work
              <ArrowDownRight
                size={17}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
            </a>
            {cvAvailable && (
              <a href="/api/cv" data-track="cv" className="btn btn-ghost">
                Download CV <ArrowDown size={16} aria-hidden="true" />
              </a>
            )}
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 px-2 py-3 text-[15px] font-medium text-muted transition-colors hover:text-text"
            >
              Get in touch
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>

          <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.06em] text-faint">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-1.5 animate-pulse-dot rounded-full bg-teal" />
              {hero.location}
            </span>
          </p>
        </div>

        <CodeWorld />
      </div>
    </section>
  );
}

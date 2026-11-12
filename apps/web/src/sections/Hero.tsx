import { ArrowRight, Download, MapPin, Send } from 'lucide-react';
import { useContent } from '../lib/content';
import { PipelineVisual } from './PipelineVisual';

export function Hero({ workHref }: { workHref: string }) {
  const { content, cvAvailable } = useContent();
  const { hero } = content;

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-20"
    >
      <div>
        <p className="font-mono text-sm text-accent">
          &gt; hello, world. I&apos;m<span className="ml-0.5 animate-blink">_</span>
        </p>
        <h1 id="hero-title" className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          {hero.name}
        </h1>
        <p className="mt-3 font-mono text-lg text-accent sm:text-xl">{hero.title}</p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{hero.tagline}</p>
        {hero.location && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={15} aria-hidden="true" /> {hero.location}
          </p>
        )}

        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Core skills">
          {hero.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-text"
            >
              {chip}
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={workHref}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-bg transition hover:brightness-110"
          >
            Explore my work <ArrowRight size={18} aria-hidden="true" />
          </a>
          {cvAvailable && (
            <a
              href="/api/cv"
              data-track="cv"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-semibold transition hover:border-accent hover:text-accent"
            >
              <Download size={18} aria-hidden="true" /> Download CV
            </a>
          )}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-semibold text-muted transition hover:text-accent"
          >
            <Send size={18} aria-hidden="true" /> Contact
          </a>
        </div>
      </div>

      <PipelineVisual />
    </section>
  );
}

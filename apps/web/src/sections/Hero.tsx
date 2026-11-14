import { ArrowDown, ArrowDownRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useContent } from '../lib/content';
import { Schematic } from './Schematic';

const ease = [0.2, 0.7, 0.2, 1] as const;

export function Hero({ workHref }: { workHref: string }) {
  const { content, cvAvailable } = useContent();
  const { hero, about } = content;
  const [first, ...rest] = hero.name.split(' ');
  const languages = about.languages.map((l) => l.name).join(' · ');

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="mx-auto max-w-[1200px] px-5 pt-32 sm:px-8 sm:pt-40"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Margin column: the spec-sheet metadata */}
        <dl className="order-2 grid grid-cols-2 gap-x-6 gap-y-4 self-end lg:order-1 lg:col-span-3 lg:grid-cols-1">
          {[
            ['Role', hero.title],
            ['Based in', hero.location],
            ['Languages', languages],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="label">{term}</dt>
              <dd className="mt-1 text-[15px]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="order-1 lg:order-2 lg:col-span-9">
          <h1
            id="hero-title"
            className="text-[clamp(3.4rem,11vw,9rem)] leading-[0.88] font-medium tracking-[-0.045em]"
          >
            <span className="block">{first}</span>{' '}
            <span className="block">
              {rest.join(' ')}
              <span aria-hidden="true" className="text-accent">
                .
              </span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="mt-8 max-w-[34ch] font-serif text-[clamp(1.65rem,3.4vw,2.6rem)] leading-[1.12] text-text"
          >
            {hero.tagline}
          </motion.p>

          <p className="mt-6 font-mono text-[13px] text-muted">
            {hero.chips.map((chip, i) => (
              <span key={chip}>
                {i > 0 && <span className="text-faint"> / </span>}
                {chip}
              </span>
            ))}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-[15px]">
            <a
              href={workHref}
              className="group inline-flex items-center gap-2 border border-accent px-4 py-2.5 font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              Explore my work
              <ArrowDownRight
                size={17}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
            </a>
            {cvAvailable && (
              <a href="/api/cv" data-track="cv" className="link inline-flex items-center gap-2">
                Download CV <ArrowDown size={16} aria-hidden="true" />
              </a>
            )}
            <a href="#contact" className="link inline-flex items-center gap-2">
              Get in touch <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 pb-24 sm:mt-28 sm:pb-32 lg:grid-cols-12">
        <p className="label lg:col-span-3">
          <span className="text-accent">Fig. 1</span>
          <span className="mx-2 text-faint">/</span>
          The shape of my recent work
        </p>
        <div className="lg:col-span-9">
          <Schematic />
        </div>
      </div>
    </section>
  );
}

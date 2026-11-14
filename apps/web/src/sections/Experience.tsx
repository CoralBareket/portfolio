import { motion } from 'motion/react';
import { useContent } from '../lib/content';

/** The intern → full-time promotion, drawn as a short progress line. */
function PromotionTrack({ text }: { text: string }) {
  return (
    <div className="mt-8 max-w-xl">
      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] uppercase">
        <span className="text-muted">Intern</span>
        <span className="relative h-px flex-1 bg-rule" aria-hidden="true">
          <motion.span
            className="absolute inset-0 origin-left bg-accent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </span>
        <span className="flex items-center gap-2 text-accent">
          <span aria-hidden="true" className="size-1.5 bg-accent" />
          Full-time
        </span>
      </div>
      <p className="mt-3 text-[15px] text-muted">{text}</p>
    </div>
  );
}

export function Experience() {
  const { content } = useContent();
  return (
    <div className="space-y-16">
      {content.experience.map((job) => (
        <article
          key={`${job.company}-${job.period}`}
          className="grid grid-cols-1 gap-4 sm:grid-cols-[170px_1fr] sm:gap-6"
        >
          <p className="label pt-2">{job.period}</p>
          <div>
            <h3 className="text-2xl font-medium tracking-tight sm:text-[1.75rem]">
              {job.role} <span className="font-serif font-normal text-muted italic">at</span> {job.company}
            </h3>
            {job.companyDescription && <p className="mt-1 text-muted">{job.companyDescription}</p>}

            {job.highlight && <PromotionTrack text={job.highlight} />}

            <ol className="mt-10 border-b border-border">
              {job.bullets.map((b, i) => (
                <li
                  key={b}
                  className="grid grid-cols-[2.5rem_1fr] border-t border-border py-3.5 leading-relaxed"
                >
                  <span className="pt-[3px] font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          </div>
        </article>
      ))}
    </div>
  );
}

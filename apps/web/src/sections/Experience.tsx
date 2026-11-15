import { motion } from 'motion/react';
import { useContent } from '../lib/content';

/** The intern → full-time promotion, drawn as a short progress line. */
function PromotionTrack({ text }: { text: string }) {
  return (
    <div className="card mt-7 max-w-xl p-5">
      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
        <span className="text-muted">Intern</span>
        <span className="relative h-px flex-1 bg-rule" aria-hidden="true">
          <motion.span
            className="absolute inset-0 origin-left bg-linear-to-r from-accent to-teal"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </span>
        <span className="flex items-center gap-2 text-teal">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-teal" />
          Full-time
        </span>
      </div>
      <p className="mt-3 text-[15px] text-muted">{text}</p>
    </div>
  );
}

/** A timeline: rail with a marker, the period beside it, then the role. */
export function Experience() {
  const { content } = useContent();
  return (
    <div className="space-y-14">
      {content.experience.map((job) => (
        <article
          key={`${job.company}-${job.period}`}
          className="grid grid-cols-[16px_1fr] gap-5 sm:grid-cols-[16px_120px_1fr] sm:gap-7"
        >
          <div aria-hidden="true" className="relative mx-auto w-px bg-rule">
            <span className="absolute top-1.5 left-[-4px] size-[9px] rounded-full border-2 border-accent bg-bg" />
          </div>
          <p className="hidden pt-1 font-mono text-[11px] text-teal sm:block">{job.period}</p>
          <div>
            <p className="font-mono text-[11px] text-teal sm:hidden">{job.period}</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:mt-0 sm:text-[1.75rem]">
              {job.role} <span className="font-normal text-muted">at</span> {job.company}
            </h3>
            {job.companyDescription && <p className="mt-1 text-muted">{job.companyDescription}</p>}

            {job.highlight && <PromotionTrack text={job.highlight} />}

            <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 lg:grid-cols-2">
              {job.bullets.map((b) => (
                <li key={b} className="flex gap-3 leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[3px] font-mono text-[13px] text-accent">
                    ▹
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}

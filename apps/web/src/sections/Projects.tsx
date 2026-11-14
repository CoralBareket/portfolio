import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@portfolio/shared';
import { useContent } from '../lib/content';

function ComingSoon() {
  return (
    <div className="border border-dashed border-rule p-6 sm:p-10">
      <p className="label">Status</p>
      <p className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">Projects coming soon.</p>
      <p className="mt-3 text-muted">
        I&apos;m currently building
        <span aria-hidden="true" className="ml-1 animate-blink text-accent">
          ▍
        </span>
      </p>
    </div>
  );
}

/** One project as a row in the index: number, title, tags, and a link to its write-up. */
function ProjectRow({ project, index }: { project: Project; index: number }) {
  return (
    <li className="border-t border-border">
      <a
        href={`/projects/${project.slug}`}
        className="group grid grid-cols-1 gap-4 py-7 sm:grid-cols-[2.5rem_1fr_auto] sm:items-start sm:gap-6"
      >
        <span className="font-mono text-[11px] text-faint">P.{String(index + 1).padStart(2, '0')}</span>
        <span>
          <span className="block text-2xl font-medium tracking-tight transition-colors group-hover:text-accent">
            {project.title}
          </span>
          {project.subtitle && (
            <span className="mt-1 block font-serif text-xl text-muted italic">{project.subtitle}</span>
          )}
          {project.description && (
            <span className="mt-3 block max-w-[60ch] leading-relaxed text-muted">{project.description}</span>
          )}
          {project.tags.length > 0 && (
            <span className="mt-4 block font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
              {project.tags.join(' · ')}
            </span>
          )}
        </span>
        <ArrowUpRight
          size={22}
          aria-hidden="true"
          className="hidden text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:block"
        />
      </a>
    </li>
  );
}

export function Projects() {
  const { projects } = useContent();
  const published = projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
  if (published.length === 0) return <ComingSoon />;
  return (
    <ol className="border-b border-border">
      {published.map((p, i) => (
        <ProjectRow key={p.id} project={p} index={i} />
      ))}
    </ol>
  );
}

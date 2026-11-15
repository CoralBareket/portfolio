import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@portfolio/shared';
import { useContent } from '../lib/content';

function ComingSoon() {
  return (
    <div className="card border-dashed border-rule p-8 sm:p-12">
      <p className="label">Status</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Projects coming soon.</p>
      <p className="mt-3 text-muted">
        I&apos;m currently building
        <span aria-hidden="true" className="ml-1 animate-blink text-accent">
          ▍
        </span>
      </p>
    </div>
  );
}

/** One project as a card: number, title, description, tags, and a link to its write-up. */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <li>
      <a href={`/projects/${project.slug}`} className="card card-hover group relative block overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_85%_0,rgb(106_168_255/0.07),transparent_40%)] p-7 sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <span className="font-mono text-[11px] tracking-[0.12em] text-faint">
              P.{String(index + 1).padStart(2, '0')}
            </span>
            <ArrowUpRight
              size={22}
              aria-hidden="true"
              className="text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </div>
          <h3 className="mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.03em]">
            {project.title}
          </h3>
          {project.subtitle && <p className="mt-1 text-lg text-accent">{project.subtitle}</p>}
          {project.description && (
            <p className="mt-4 max-w-[64ch] leading-relaxed text-muted">{project.description}</p>
          )}
          {project.tags.length > 0 && (
            <span className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>
      </a>
    </li>
  );
}

export function Projects() {
  const { projects } = useContent();
  const published = projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
  if (published.length === 0) return <ComingSoon />;
  return (
    <ol className="space-y-5">
      {published.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} />
      ))}
    </ol>
  );
}

import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@portfolio/shared';
import { Reveal } from '../components/Reveal';
import { GithubIcon } from '../components/icons';
import { useContent } from '../lib/content';

function ComingSoon() {
  return (
    <Reveal>
      <div className="max-w-2xl rounded-xl border border-dashed border-border bg-surface/60 p-6 font-mono text-sm sm:p-8">
        <p className="text-muted">
          <span className="text-accent">$</span> ls ./projects
        </p>
        <p className="mt-3 text-text">Projects coming soon. I&apos;m currently building.</p>
        <p className="mt-3 text-muted">
          <span className="text-accent">$</span>
          <span className="ml-1 animate-blink">▍</span>
        </p>
      </div>
    </Reveal>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50">
      {project.cover && (
        <img
          src={project.cover.url}
          alt=""
          loading="lazy"
          className="aspect-video w-full border-b border-border object-cover"
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold">
          <a href={`/projects/${project.slug}`} className="hover:text-accent">
            {project.title}
          </a>
        </h3>
        {project.subtitle && <p className="mt-1 text-sm text-accent">{project.subtitle}</p>}
        <p className="mt-3 flex-1 text-muted">{project.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <li key={t} className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-4 text-sm">
          {project.repoUrl && (
            <a href={project.repoUrl} className="inline-flex items-center gap-1.5 hover:text-accent">
              <GithubIcon size={15} /> Code
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} className="inline-flex items-center gap-1.5 hover:text-accent">
              <ArrowUpRight size={15} aria-hidden="true" /> Live demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const { projects } = useContent();
  const published = projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
  if (published.length === 0) return <ComingSoon />;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {published.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.05}>
          <ProjectCard project={p} />
        </Reveal>
      ))}
    </div>
  );
}

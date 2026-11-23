import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@portfolio/shared';
import { cloudinarySrcSet, cloudinaryUrl } from '../lib/cloudinary';
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

/**
 * One project as a card. With a cover, the screenshot leads (right on desktop, on top on phones);
 * without one, the text spans the full width.
 */
function ProjectCard({ project }: { project: Project }) {
  const { cover } = project;
  return (
    <li>
      <a
        href={`/projects/${project.slug}`}
        className={`card card-hover group grid overflow-hidden ${cover ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]' : ''}`}
      >
        {cover && (
          <div className="p-3 pb-0 sm:p-4 sm:pb-0 lg:order-2 lg:p-4 lg:pl-0">
            <div className="cover-frame aspect-[16/10]">
              <img
                src={cloudinaryUrl(cover.url, 960)}
                srcSet={cloudinarySrcSet(cover.url, [640, 960, 1280])}
                sizes="(min-width: 1024px) 600px, 100vw"
                width={1600}
                height={1000}
                loading="lazy"
                decoding="async"
                alt=""
                className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col p-7 sm:p-10">
          <h3 className="text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="mt-3 max-w-[48ch] text-lg leading-snug text-accent">{project.subtitle}</p>
          )}
          {project.description && (
            <p className="mt-4 max-w-[60ch] leading-relaxed text-muted">{project.description}</p>
          )}
          {project.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
              {project.tags.map((tag) => (
                <li key={tag} className="chip">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <span className="mt-8 inline-flex items-center gap-1.5 text-[15px] font-medium text-text transition-colors group-hover:text-accent lg:mt-auto lg:pt-8">
            Read the case study
            <ArrowUpRight
              size={17}
              aria-hidden="true"
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
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
    <ol className="space-y-6">
      {published.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </ol>
  );
}

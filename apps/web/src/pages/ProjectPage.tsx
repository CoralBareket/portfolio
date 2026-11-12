import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import type { Project } from '@portfolio/shared';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { GithubIcon } from '../components/icons';
import { SITE_URL } from '../lib/site';

type State = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; project: Project };

/** Pre-rendered per published project at build time; fetched client-side for newer ones. */
export function ProjectPage({ initial }: { initial?: Project }) {
  const { slug = '' } = useParams();
  const [state, setState] = useState<State>(
    initial ? { status: 'ready', project: initial } : { status: 'loading' },
  );

  useEffect(() => {
    if (initial) return;
    fetch(`/api/projects/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? (res.json() as Promise<{ project: Project }>) : Promise.reject(new Error())))
      .then(({ project }) => setState({ status: 'ready', project }))
      .catch(() => setState({ status: 'missing' }));
  }, [slug, initial]);

  return (
    <MotionConfig reducedMotion="user">
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
        <a
          href="/#projects"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" /> back to portfolio
        </a>
        {state.status === 'loading' && <p className="mt-10 text-muted">Loading project…</p>}
        {state.status === 'missing' && (
          <>
            <Head>
              <title>Project not found · Coral Bareket</title>
              <meta name="robots" content="noindex" />
            </Head>
            <h1 className="mt-10 text-3xl font-bold">Project not found</h1>
          </>
        )}
        {state.status === 'ready' && <ProjectDetail project={state.project} />}
      </main>
    </MotionConfig>
  );
}

function ProjectDetail({ project: p }: { project: Project }) {
  const url = `${SITE_URL}/projects/${p.slug}`;
  const description = p.description || p.subtitle;
  return (
    <article className="mt-10">
      <Head>
        <title>{`${p.title} · Coral Bareket`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={p.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={p.cover?.url ?? `${SITE_URL}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <p className="font-mono text-sm text-accent">// project</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{p.title}</h1>
      {p.subtitle && <p className="mt-3 text-lg text-accent">{p.subtitle}</p>}
      {p.description && <p className="mt-5 text-lg leading-relaxed text-muted">{p.description}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {p.repoUrl && (
          <a
            href={p.repoUrl}
            data-track="repo"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-semibold hover:border-accent hover:text-accent"
          >
            <GithubIcon size={16} /> Source code
          </a>
        )}
        {p.demoUrl && (
          <a
            href={p.demoUrl}
            data-track="demo"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-bg hover:brightness-110"
          >
            <ArrowUpRight size={16} aria-hidden="true" /> Live demo
          </a>
        )}
      </div>

      {p.cover && (
        <img
          src={p.cover.url}
          alt={`${p.title} screenshot`}
          className="mt-10 w-full rounded-xl border border-border"
        />
      )}

      {p.tags.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
          {p.tags.map((t) => (
            <li key={t} className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted">
              {t}
            </li>
          ))}
        </ul>
      )}

      {p.problem && <Block title="The problem">{p.problem}</Block>}
      {p.approach && <Block title="My approach">{p.approach}</Block>}

      {p.architecture.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-bold">Architecture</h2>
          <ArchitectureFlow steps={p.architecture} />
        </section>
      )}

      {p.keyDecisions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Key decisions</h2>
          <ul className="mt-4 space-y-3">
            {p.keyDecisions.map((d) => (
              <li key={d} className="flex gap-3 text-muted">
                <span aria-hidden="true" className="font-mono text-accent">
                  ▹
                </span>
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Block({ title, children }: { title: string; children: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-4 leading-relaxed whitespace-pre-line text-muted">{children}</p>
    </section>
  );
}

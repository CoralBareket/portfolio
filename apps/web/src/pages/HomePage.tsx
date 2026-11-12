import { defaultContent } from '@portfolio/shared';

/** Phase 2 placeholder: proves the toolchain (pre-render, Tailwind tokens, shared package). */
export function HomePage() {
  const { hero } = defaultContent;
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-4 sm:px-8">
      <p className="font-mono text-sm text-accent">&gt; hello, world_</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">{hero.name}</h1>
      <p className="mt-3 font-mono text-lg text-muted">{hero.title}</p>
      <p className="mt-8 max-w-xl text-muted">Site under construction.</p>
    </main>
  );
}

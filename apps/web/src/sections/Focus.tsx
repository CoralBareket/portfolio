import { useContent } from '../lib/content';

export function Focus() {
  const { content } = useContent();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {content.focusAreas.map((area, i) => (
        <article key={area.title} className="card card-hover relative p-7 sm:p-8">
          <p aria-hidden="true" className="absolute top-7 right-7 font-mono text-[11px] text-faint">
            {String(i + 1).padStart(2, '0')}
          </p>
          <span aria-hidden="true" className="block h-0.5 w-8 bg-accent" />
          <h3 className="mt-6 text-xl font-semibold tracking-tight">{area.title}</h3>
          <p className="mt-3 max-w-[48ch] leading-relaxed text-muted">{area.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {area.tags.map((tag) => (
              <li key={tag} className="chip">
                {tag}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

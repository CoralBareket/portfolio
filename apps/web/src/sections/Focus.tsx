import { useContent } from '../lib/content';

export function Focus() {
  const { content } = useContent();
  return (
    <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
      {content.focusAreas.map((area, i) => (
        <article key={area.title} className="group border-t border-border py-7">
          <p className="font-mono text-[11px] tracking-[0.14em] text-faint transition-colors group-hover:text-accent">
            {String.fromCharCode(65 + i)}.
          </p>
          <h3 className="mt-3 text-xl font-medium tracking-tight">{area.title}</h3>
          <p className="mt-3 max-w-[46ch] leading-relaxed text-muted">{area.description}</p>
          <p className="mt-5 font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
            {area.tags.map((tag, j) => (
              <span key={tag}>
                {j > 0 && <span className="text-faint"> · </span>}
                {tag}
              </span>
            ))}
          </p>
        </article>
      ))}
    </div>
  );
}

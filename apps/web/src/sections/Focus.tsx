import { Cloud, Database, Layers, Server, type LucideIcon } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { useContent } from '../lib/content';

const icons: LucideIcon[] = [Server, Database, Cloud, Layers];

export function Focus() {
  const { content } = useContent();
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {content.focusAreas.map((area, i) => {
        const Icon = icons[i % icons.length] ?? Layers;
        return (
          <Reveal key={area.title} delay={i * 0.06}>
            <article className="group h-full rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold">{area.title}</h3>
              </div>
              <p className="mt-4 leading-relaxed text-muted">{area.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${area.title} technologies`}>
                {area.tags.map((tag) => (
                  <li key={tag} className="font-mono text-xs text-accent/90">
                    #{tag}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

import { Reveal } from '../components/Reveal';
import { TechIcon } from '../components/icons';
import { useContent } from '../lib/content';

export function TechStack() {
  const { content } = useContent();
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {content.skills.map((group, i) => (
        <Reveal key={group.name} delay={i * 0.05}>
          <div className="h-full rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50">
            <h3 className="font-mono text-sm font-semibold text-accent">{group.name}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="group inline-flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm"
                >
                  <span className="text-muted transition-colors group-hover:text-accent">
                    <TechIcon name={item} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

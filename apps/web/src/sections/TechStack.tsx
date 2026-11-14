import { useContent } from '../lib/content';

/** A spec table: one row per group, items set like a parts list. */
export function TechStack() {
  const { content } = useContent();
  return (
    <dl className="border-b border-border">
      {content.skills.map((group) => (
        <div
          key={group.name}
          className="group grid grid-cols-1 gap-2 border-t border-border py-5 transition-colors sm:grid-cols-[170px_1fr] sm:gap-6"
        >
          <dt className="label pt-[5px] transition-colors group-hover:text-accent">{group.name}</dt>
          <dd className="text-[17px] leading-relaxed sm:text-lg">
            {group.items.map((item, i) => (
              <span key={item}>
                {i > 0 && (
                  <span aria-hidden="true" className="mx-1 text-faint">
                    {' / '}
                  </span>
                )}
                <span className="whitespace-nowrap">{item}</span>
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

import { useContent } from '../lib/content';

/** One card per skill group, items as tech pills. */
export function TechStack() {
  const { content } = useContent();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {content.skills.map((group, i) => (
        <div key={group.name} className="card card-hover p-6">
          <p className="label flex items-center justify-between">
            {group.name}
            <span aria-hidden="true" className="text-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

import { useContent } from '../lib/content';

export function About() {
  const { content } = useContent();
  const { about } = content;
  const [lead, ...rest] = about.paragraphs;

  const facts: [string, React.ReactNode][] = [
    [
      'Education',
      <>
        {about.education.degree}
        <span className="block text-muted">
          {about.education.school} · {about.education.period}
        </span>
      </>,
    ],
    [
      'Service',
      about.service.map((s) => (
        <span key={s.org} className="block">
          {s.role}, {s.org} <span className="text-muted">· {s.period}</span>
        </span>
      )),
    ],
    [
      'Languages',
      about.languages.map((l) => (
        <span key={l.name} className="block">
          {l.name} <span className="text-muted">· {l.level}</span>
        </span>
      )),
    ],
  ];

  return (
    <div>
      {lead && (
        <p className="max-w-[30ch] font-serif text-[1.9rem] leading-[1.18] sm:text-[2.3rem]">{lead}</p>
      )}
      {rest.map((p) => (
        <p key={p} className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted">
          {p}
        </p>
      ))}

      <dl className="mt-14 border-b border-border">
        {facts.map(([term, value]) => (
          <div
            key={term}
            className="grid grid-cols-1 gap-2 border-t border-border py-5 sm:grid-cols-[170px_1fr] sm:gap-6"
          >
            <dt className="label pt-[5px]">{term}</dt>
            <dd className="text-[17px] leading-relaxed">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

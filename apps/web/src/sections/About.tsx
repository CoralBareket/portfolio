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
        <span className="mt-1 block text-[15px] text-muted">
          {about.education.school} · {about.education.period}
        </span>
      </>,
    ],
    [
      'Service',
      about.service.map((s) => (
        <span key={s.org} className="block">
          {s.role}, {s.org} <span className="block text-[15px] text-muted">{s.period}</span>
        </span>
      )),
    ],
    [
      'Languages',
      about.languages.map((l) => (
        <span key={l.name} className="block">
          {l.name} <span className="text-[15px] text-muted">· {l.level}</span>
        </span>
      )),
    ],
  ];

  return (
    <div>
      {lead && (
        <p className="max-w-[40ch] text-[clamp(1.4rem,2.6vw,2rem)] leading-snug font-medium tracking-[-0.02em]">
          {lead}
        </p>
      )}
      {rest.map((p) => (
        <p key={p} className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          {p}
        </p>
      ))}

      <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {facts.map(([term, value]) => (
          <div key={term} className="card card-hover p-6">
            <dt className="label">{term}</dt>
            <dd className="mt-4 space-y-3 text-[16px] leading-snug">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

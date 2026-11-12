import { GraduationCap, HeartPulse, Languages } from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal } from '../components/Reveal';
import { useContent } from '../lib/content';

function Fact({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="flex items-center gap-2 font-mono text-sm font-semibold text-accent">
        {icon} {title}
      </h3>
      <div className="mt-3 space-y-2 text-sm">{children}</div>
    </div>
  );
}

export function About() {
  const { content } = useContent();
  const { about } = content;
  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <Reveal>
        <div className="space-y-5 text-lg leading-relaxed text-muted">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid gap-4">
          <Fact icon={<GraduationCap size={16} aria-hidden="true" />} title="Education">
            <p>{about.education.degree}</p>
            <p className="text-muted">
              {about.education.school} · <span className="font-mono">{about.education.period}</span>
            </p>
          </Fact>
          <Fact icon={<HeartPulse size={16} aria-hidden="true" />} title="Service">
            {about.service.map((s) => (
              <p key={s.org}>
                {s.role}, {s.org} <span className="font-mono text-muted">· {s.period}</span>
              </p>
            ))}
          </Fact>
          <Fact icon={<Languages size={16} aria-hidden="true" />} title="Languages">
            <p>
              {about.languages.map((l, i) => (
                <span key={l.name}>
                  {i > 0 && ' · '}
                  {l.name} <span className="text-muted">({l.level})</span>
                </span>
              ))}
            </p>
          </Fact>
        </div>
      </Reveal>
    </div>
  );
}

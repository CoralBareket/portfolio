import type { User } from 'firebase/auth';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { siteContentSchema, type SiteContent } from '@portfolio/shared';
import { adminFetch, describeError } from './api';
import { Button, Card, Field, Notice, TextArea, Toggle } from './ui';
import { commaList, lines } from './text';

const at = <T,>(list: T[], i: number): T => {
  const item = list[i];
  if (item === undefined) throw new Error(`No item at index ${i}`);
  return item;
};

/** Skills are edited as lines of "Group: item, item, item". */
const skillsToText = (s: SiteContent['skills']) =>
  s.map((g) => `${g.name}: ${g.items.join(', ')}`).join('\n');
const textToSkills = (t: string): SiteContent['skills'] =>
  lines(t).map((l) => {
    const [name = '', items = ''] = l.split(/:(.*)/s);
    return { name: name.trim(), items: commaList(items) };
  });

export function ContentAdmin({ user }: { user: User }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [skills, setSkills] = useState('');
  const [paragraphs, setParagraphs] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    adminFetch<{ content: SiteContent }>(user, '/content')
      .then(({ content: c }) => {
        setContent(c);
        setSkills(skillsToText(c.skills));
        setParagraphs(c.about.paragraphs.join('\n\n'));
      })
      .catch((err) => setNotice({ kind: 'error', text: describeError(err) }));
  }, [user]);

  if (!content)
    return (
      <Card title="Site content">{notice ? <Notice kind="error">{notice.text}</Notice> : 'Loading…'}</Card>
    );

  /** Clone, let the caller mutate the draft, then store it. */
  const update = (mutate: (draft: SiteContent) => void) =>
    setContent((c) => {
      if (!c) return c;
      const draft = structuredClone(c);
      mutate(draft);
      return draft;
    });

  const save = async () => {
    setNotice(null);
    const candidate = {
      ...content,
      skills: textToSkills(skills),
      about: {
        ...content.about,
        paragraphs: paragraphs
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      },
    };
    const parsed = siteContentSchema.safeParse(candidate);
    if (!parsed.success) {
      setNotice({
        kind: 'error',
        text: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '),
      });
      return;
    }
    setBusy(true);
    try {
      await adminFetch(user, '/content', { method: 'PUT', body: JSON.stringify(parsed.data) });
      setNotice({
        kind: 'success',
        text: 'Saved. The public site picks it up within about 5 minutes (CDN cache).',
      });
    } catch (err) {
      setNotice({ kind: 'error', text: describeError(err) });
    } finally {
      setBusy(false);
    }
  };

  const { hero, settings, focusAreas, experience } = content;

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg/90 p-3 backdrop-blur">
        <p className="text-sm text-muted">Edit any section, then save once.</p>
        <Button onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save all changes'}
        </Button>
      </div>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <Card title="Settings">
        <Toggle
          label='Hide the Projects section and its nav link (instead of showing "coming soon")'
          checked={settings.hideProjects}
          onChange={(v) =>
            update((c) => {
              c.settings.hideProjects = v;
            })
          }
        />
      </Card>

      <Card title="Hero">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Name"
            value={hero.name}
            onChange={(e) =>
              update((c) => {
                c.hero.name = e.target.value;
              })
            }
          />
          <Field
            label="Title"
            value={hero.title}
            onChange={(e) =>
              update((c) => {
                c.hero.title = e.target.value;
              })
            }
          />
          <div className="md:col-span-2">
            <Field
              label="One-line value statement"
              value={hero.tagline}
              onChange={(e) =>
                update((c) => {
                  c.hero.tagline = e.target.value;
                })
              }
            />
          </div>
          <Field
            label="Location"
            value={hero.location}
            onChange={(e) =>
              update((c) => {
                c.hero.location = e.target.value;
              })
            }
          />
          <Field
            label="Skill chips"
            hint="comma separated"
            defaultValue={hero.chips.join(', ')}
            onBlur={(e) =>
              update((c) => {
                c.hero.chips = commaList(e.target.value);
              })
            }
          />
        </div>
      </Card>

      <Card title="Tech stack">
        <TextArea
          label="One group per line"
          hint='Format: "Group: item, item, item". Known names get their logo automatically.'
          rows={7}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
      </Card>

      <Card title="Engineering focus">
        <div className="grid gap-4 md:grid-cols-2">
          {focusAreas.map((area, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <Field
                label="Title"
                value={area.title}
                onChange={(e) =>
                  update((c) => {
                    at(c.focusAreas, i).title = e.target.value;
                  })
                }
              />
              <TextArea
                label="Description"
                rows={4}
                value={area.description}
                onChange={(e) =>
                  update((c) => {
                    at(c.focusAreas, i).description = e.target.value;
                  })
                }
              />
              <Field
                label="Tags"
                hint="comma separated"
                defaultValue={area.tags.join(', ')}
                onBlur={(e) =>
                  update((c) => {
                    at(c.focusAreas, i).tags = commaList(e.target.value);
                  })
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Experience"
        actions={
          <Button
            variant="ghost"
            onClick={() =>
              update((c) => {
                c.experience.push({
                  role: 'Role',
                  company: 'Company',
                  companyDescription: '',
                  period: '',
                  highlight: '',
                  bullets: [],
                });
              })
            }
          >
            <Plus size={15} aria-hidden="true" /> Add role
          </Button>
        }
      >
        <div className="space-y-4">
          {experience.map((job, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
              <Field
                label="Role"
                value={job.role}
                onChange={(e) =>
                  update((c) => {
                    at(c.experience, i).role = e.target.value;
                  })
                }
              />
              <Field
                label="Company"
                value={job.company}
                onChange={(e) =>
                  update((c) => {
                    at(c.experience, i).company = e.target.value;
                  })
                }
              />
              <Field
                label="Company description"
                value={job.companyDescription}
                onChange={(e) =>
                  update((c) => {
                    at(c.experience, i).companyDescription = e.target.value;
                  })
                }
              />
              <Field
                label="Period"
                value={job.period}
                onChange={(e) =>
                  update((c) => {
                    at(c.experience, i).period = e.target.value;
                  })
                }
              />
              <div className="md:col-span-2">
                <Field
                  label="Highlight (shown as the promotion banner)"
                  value={job.highlight}
                  onChange={(e) =>
                    update((c) => {
                      at(c.experience, i).highlight = e.target.value;
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="Bullets"
                  hint="one per line"
                  rows={6}
                  defaultValue={job.bullets.join('\n')}
                  onBlur={(e) =>
                    update((c) => {
                      at(c.experience, i).bullets = lines(e.target.value);
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  variant="danger"
                  onClick={() =>
                    update((c) => {
                      c.experience.splice(i, 1);
                    })
                  }
                >
                  <Trash2 size={15} aria-hidden="true" /> Remove role
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="About">
        <TextArea
          label="Paragraphs"
          hint="separate paragraphs with an empty line"
          rows={8}
          value={paragraphs}
          onChange={(e) => setParagraphs(e.target.value)}
        />
      </Card>
    </div>
  );
}

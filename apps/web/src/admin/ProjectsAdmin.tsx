import type { User } from 'firebase/auth';
import { Eye, EyeOff, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { projectInputSchema, type Project, type ProjectInput } from '@portfolio/shared';
import { adminFetch, describeError, uploadFile } from './api';
import { Button, Card, Field, Notice, TextArea, Toggle } from './ui';
import { commaList, lines } from './text';

const empty: ProjectInput = projectInputSchema.parse({ slug: 'new-project', title: 'New project' });

export function ProjectsAdmin({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [editing, setEditing] = useState<{ id?: string; draft: ProjectInput } | null>(null);
  const [error, setError] = useState('');

  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    adminFetch<{ projects: Project[] }>(user, '/projects')
      .then((data) => setProjects(data.projects))
      .catch((err) => setError(describeError(err)));
  }, [user, version]);

  const remove = async (p: Project) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await adminFetch(user, `/projects/${p.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setError(describeError(err));
    }
  };

  if (editing) {
    return (
      <ProjectEditor
        user={user}
        id={editing.id}
        initial={editing.draft}
        onDone={() => {
          setEditing(null);
          reload();
        }}
      />
    );
  }

  return (
    <Card
      title="Projects"
      actions={
        <Button onClick={() => setEditing({ draft: { ...empty, order: projects?.length ?? 0 } })}>
          <Plus size={15} aria-hidden="true" /> New project
        </Button>
      }
    >
      {error && <Notice kind="error">{error}</Notice>}
      {projects?.length === 0 && (
        <p className="text-sm text-muted">
          No projects yet. The public site shows &ldquo;Projects coming soon&rdquo; until one is published.
        </p>
      )}
      <ul className="divide-y divide-border">
        {projects?.map((p) => {
          const { id: _id, updatedAt: _u, ...draft } = p;
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold">
                  <span className="mr-2 font-mono text-xs text-muted">#{p.order}</span>
                  {p.title}
                </p>
                <p className="text-xs text-muted">
                  /projects/{p.slug} ·{' '}
                  {p.published ? (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Eye size={12} aria-hidden="true" /> published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <EyeOff size={12} aria-hidden="true" /> draft
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setEditing({ id: p.id, draft })}>
                  <Pencil size={15} aria-hidden="true" /> Edit
                </Button>
                <Button variant="danger" onClick={() => remove(p)} aria-label={`Delete ${p.title}`}>
                  <Trash2 size={15} aria-hidden="true" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** Architecture steps are edited as lines of "Step | detail". */
const archToText = (a: ProjectInput['architecture']) =>
  a.map((s) => (s.detail ? `${s.step} | ${s.detail}` : s.step)).join('\n');
const textToArch = (t: string) =>
  lines(t).map((l) => {
    const [step = '', ...rest] = l.split('|');
    return { step: step.trim(), detail: rest.join('|').trim() };
  });

function ProjectEditor({
  user,
  id,
  initial,
  onDone,
}: {
  user: User;
  id?: string;
  initial: ProjectInput;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [arch, setArch] = useState(archToText(initial.architecture));
  const [decisions, setDecisions] = useState(initial.keyDecisions.join('\n'));
  const [tags, setTags] = useState(initial.tags.join(', '));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url, publicId } = await uploadFile(user, 'image', file);
      set('cover', { url, publicId });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setError('');
    const parsed = projectInputSchema.safeParse({
      ...draft,
      architecture: textToArch(arch),
      keyDecisions: lines(decisions),
      tags: commaList(tags),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '));
      return;
    }
    setBusy(true);
    try {
      await adminFetch(user, id ? `/projects/${id}` : '/projects', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(parsed.data),
      });
      onDone();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title={id ? `Edit: ${initial.title}` : 'New project'}
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" value={draft.title} onChange={(e) => set('title', e.target.value)} />
        <Field
          label="Slug (URL)"
          hint="lowercase-with-dashes, used in /projects/<slug>"
          value={draft.slug}
          onChange={(e) => set('slug', e.target.value)}
        />
        <Field label="Subtitle" value={draft.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
        <Field
          label="Tech tags"
          hint="comma separated"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="md:col-span-2">
          <TextArea
            label="Short description (card)"
            rows={2}
            value={draft.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
        <TextArea
          label="Problem"
          rows={4}
          value={draft.problem}
          onChange={(e) => set('problem', e.target.value)}
        />
        <TextArea
          label="Approach"
          rows={4}
          value={draft.approach}
          onChange={(e) => set('approach', e.target.value)}
        />
        <TextArea
          label="Key decisions"
          hint="one per line"
          rows={4}
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
        />
        <TextArea
          label="Architecture flow"
          hint='one step per line: "Step | detail", drawn as a flow diagram'
          rows={4}
          value={arch}
          onChange={(e) => setArch(e.target.value)}
        />
        <Field label="Repo URL" value={draft.repoUrl} onChange={(e) => set('repoUrl', e.target.value)} />
        <Field label="Live demo URL" value={draft.demoUrl} onChange={(e) => set('demoUrl', e.target.value)} />
        <Field
          label="Order"
          type="number"
          min={0}
          value={draft.order}
          onChange={(e) => set('order', Number(e.target.value))}
        />
        <div className="flex items-end">
          <Toggle
            label="Published (visible on the site)"
            checked={draft.published}
            onChange={(v) => set('published', v)}
          />
        </div>
        <div className="md:col-span-2">
          <p className="font-mono text-xs text-muted">Cover image</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {draft.cover && (
              <img
                src={draft.cover.url}
                alt="Current cover"
                className="h-20 rounded-md border border-border"
              />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold hover:border-accent hover:text-accent">
              <Upload size={15} aria-hidden="true" /> {draft.cover ? 'Replace' : 'Upload'} image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => void uploadCover(e.target.files?.[0])}
              />
            </label>
            {draft.cover && (
              <Button variant="ghost" onClick={() => set('cover', null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-4">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
    </Card>
  );
}

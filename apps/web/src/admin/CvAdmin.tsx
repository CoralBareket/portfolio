import type { User } from 'firebase/auth';
import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CvInfo } from '@portfolio/shared';
import { adminFetch, describeError, uploadFile } from './api';
import { Card, Notice } from './ui';

export function CvAdmin({ user }: { user: User }) {
  const [cv, setCv] = useState<CvInfo | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    adminFetch<{ cv: CvInfo | null }>(user, '/cv')
      .then((d) => setCv(d.cv))
      .catch((err) => setNotice({ kind: 'error', text: describeError(err) }));
  }, [user]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf')
      return setNotice({ kind: 'error', text: 'Please choose a PDF file.' });
    setBusy(true);
    setNotice(null);
    try {
      const uploaded = await uploadFile(user, 'cv', file);
      const data = await adminFetch<{ cv: CvInfo }>(user, '/cv', {
        method: 'PUT',
        body: JSON.stringify(uploaded),
      });
      setCv(data.cv);
      setNotice({ kind: 'success', text: 'New CV is live. Visitors get it from the Download CV button.' });
    } catch (err) {
      setNotice({ kind: 'error', text: describeError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="CV">
      <div className="space-y-4 text-sm">
        {cv === undefined && <p className="text-muted">Loading…</p>}
        {cv === null && (
          <p className="text-muted">
            No CV uploaded yet. The Download CV button is hidden until you add one.
          </p>
        )}
        {cv && (
          <p>
            Current: <span className="font-mono">{cv.fileName}</span>{' '}
            <span className="text-muted">· uploaded {new Date(cv.uploadedAt).toLocaleDateString()}</span> ·{' '}
            <a href="/api/cv" className="text-accent underline">
              test download
            </a>
          </p>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-3.5 py-2 font-semibold text-bg hover:brightness-110">
          <Upload size={15} aria-hidden="true" />{' '}
          {busy ? 'Uploading…' : cv ? 'Replace CV (PDF)' : 'Upload CV (PDF)'}
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      </div>
    </Card>
  );
}

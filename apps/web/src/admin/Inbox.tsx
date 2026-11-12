import type { User } from 'firebase/auth';
import { Archive, Mail, MailOpen, Reply } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ContactMessage, MessageStatus } from '@portfolio/shared';
import { adminFetch, describeError } from './api';
import { Button, Card, Notice } from './ui';

type Filter = 'active' | 'unread' | 'archived';

export function Inbox({ user, onUnreadChange }: { user: User; onUnreadChange: (n: number) => void }) {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [filter, setFilter] = useState<Filter>('active');
  const [error, setError] = useState('');

  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    adminFetch<{ messages: ContactMessage[]; unread: number }>(user, '/messages')
      .then((data) => {
        setMessages(data.messages);
        onUnreadChange(data.unread);
      })
      .catch((err) => setError(describeError(err)));
  }, [user, onUnreadChange, version]);

  const setStatus = async (id: string, status: MessageStatus) => {
    try {
      await adminFetch(user, `/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      reload();
    } catch (err) {
      setError(describeError(err));
    }
  };

  const visible = (messages ?? []).filter((m) =>
    filter === 'active' ? m.status !== 'archived' : m.status === filter,
  );

  return (
    <Card
      title="Contact inbox"
      actions={
        <div className="flex gap-1 text-sm">
          {(['active', 'unread', 'archived'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-md px-2.5 py-1 capitalize ${filter === f ? 'bg-accent-soft text-accent' : 'text-muted'}`}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      {error && <Notice kind="error">{error}</Notice>}
      {messages === null && !error && <p className="text-sm text-muted">Loading…</p>}
      {messages && visible.length === 0 && <p className="text-sm text-muted">No messages here.</p>}

      <ul className="space-y-3">
        {visible.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg border p-4 ${m.status === 'unread' ? 'border-accent/50 bg-accent-soft/40' : 'border-border'}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {m.status === 'unread' && (
                  <span className="mr-2 inline-block size-2 rounded-full bg-accent" />
                )}
                {m.name} <span className="font-normal text-muted">&lt;{m.email}&gt;</span>
              </p>
              <time className="font-mono text-xs text-muted" dateTime={m.createdAt}>
                {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
              </time>
            </div>
            <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message on my portfolio')}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                <Reply size={15} aria-hidden="true" /> Reply
              </a>
              {m.status === 'unread' ? (
                <Button variant="ghost" onClick={() => setStatus(m.id, 'read')}>
                  <MailOpen size={15} aria-hidden="true" /> Mark read
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setStatus(m.id, 'unread')}>
                  <Mail size={15} aria-hidden="true" /> Mark unread
                </Button>
              )}
              {m.status !== 'archived' && (
                <Button variant="ghost" onClick={() => setStatus(m.id, 'archived')}>
                  <Archive size={15} aria-hidden="true" /> Archive
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

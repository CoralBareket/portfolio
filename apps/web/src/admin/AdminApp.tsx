import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { FileText, FolderKanban, Inbox as InboxIcon, LogOut, PenSquare } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ANALYTICS_EXCLUDE_KEY } from '../lib/site';
import { ContentAdmin } from './ContentAdmin';
import { CvAdmin } from './CvAdmin';
import { getAdminAuth } from './firebase';
import { Inbox } from './Inbox';
import { ProjectsAdmin } from './ProjectsAdmin';
import { Button, Card, Notice } from './ui';

type Session =
  { state: 'loading' } | { state: 'signed-out' } | { state: 'ready'; user: User; isAdmin: boolean };
type Tab = 'inbox' | 'projects' | 'content' | 'cv';

export default function AdminApp() {
  const auth = useMemo(() => getAdminAuth(), []);
  const [session, setSession] = useState<Session>({ state: 'loading' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) return setSession({ state: 'signed-out' });
      const token = await user.getIdTokenResult(true);
      const isAdmin = token.claims.admin === true;
      if (isAdmin) {
        try {
          localStorage.setItem(ANALYTICS_EXCLUDE_KEY, '1');
        } catch {
          /* storage blocked: tracker also skips /admin */
        }
      }
      setSession({ state: 'ready', user, isAdmin });
    });
  }, [auth]);

  if (!auth) {
    return (
      <Shell>
        <Notice kind="error">
          Firebase isn&apos;t configured. Add the VITE_FIREBASE_* values to .env.local (see .env.example).
        </Notice>
      </Shell>
    );
  }

  const signIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    }
  };

  if (session.state === 'loading') return <Shell>Loading…</Shell>;

  if (session.state === 'signed-out') {
    return (
      <Shell>
        <Card title="Admin sign-in">
          <p className="mb-4 text-sm text-muted">This area is private.</p>
          <Button onClick={signIn}>Sign in with Google</Button>
          {error && (
            <div className="mt-4">
              <Notice kind="error">{error}</Notice>
            </div>
          )}
        </Card>
      </Shell>
    );
  }

  if (!session.isAdmin) {
    return (
      <Shell>
        <Card title="Not authorized">
          <p className="mb-4 text-sm text-muted">
            Signed in as {session.user.email}, which isn&apos;t an admin account.
          </p>
          <Button variant="ghost" onClick={() => signOut(auth)}>
            Sign out
          </Button>
        </Card>
      </Shell>
    );
  }

  return <Dashboard user={session.user} onSignOut={() => signOut(auth)} />;
}

function Dashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('inbox');
  const [unread, setUnread] = useState(0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon size={16} aria-hidden="true" /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={16} aria-hidden="true" /> },
    { id: 'content', label: 'Content', icon: <PenSquare size={16} aria-hidden="true" /> },
    { id: 'cv', label: 'CV', icon: <FileText size={16} aria-hidden="true" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <a href="/" className="font-mono font-bold">
          <span className="text-accent">&gt;</span> admin<span className="text-accent">.</span>panel
        </a>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="hidden sm:inline">{user.email}</span>
          <Button variant="ghost" onClick={onSignOut}>
            <LogOut size={15} aria-hidden="true" /> Sign out
          </Button>
        </div>
      </header>

      <nav aria-label="Admin sections" className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.id ? 'bg-accent-soft text-accent' : 'text-muted hover:text-text'
            }`}
          >
            {t.icon} {t.label}
            {t.id === 'inbox' && unread > 0 && (
              <span
                className="rounded-full bg-accent px-1.5 text-xs font-bold text-bg"
                aria-label={`${unread} unread`}
              >
                {unread}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="mt-6">
        {tab === 'inbox' && <Inbox user={user} onUnreadChange={setUnread} />}
        {tab === 'projects' && <ProjectsAdmin user={user} />}
        {tab === 'content' && <ContentAdmin user={user} />}
        {tab === 'cv' && <CvAdmin user={user} />}
      </main>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-4 py-24 text-sm">{children}</div>;
}

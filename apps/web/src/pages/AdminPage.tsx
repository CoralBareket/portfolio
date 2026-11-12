import { lazy, Suspense } from 'react';
import { ClientOnly, Head } from 'vite-react-ssg';

// The admin bundle (Firebase Auth SDK included) loads only on /admin, never on the public site.
const AdminApp = lazy(() => import('../admin/AdminApp'));

export function AdminPage() {
  return (
    <>
      <Head>
        <title>Admin · Coral Bareket</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ClientOnly>
        {() => (
          <Suspense fallback={<p className="p-8 text-sm text-muted">Loading admin…</p>}>
            <AdminApp />
          </Suspense>
        )}
      </ClientOnly>
    </>
  );
}

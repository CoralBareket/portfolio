import type { RouteRecord } from 'vite-react-ssg';
import { buildData } from './lib/build-data';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';

export const routes: RouteRecord[] = [
  { path: '/', element: <HomePage />, entry: 'src/pages/HomePage.tsx' },
  {
    path: '/projects/:slug',
    element: <ProjectPage />,
    entry: 'src/pages/ProjectPage.tsx',
    // Every published project gets real HTML; "_" is the loading shell for newer projects.
    getStaticPaths: () => ['projects/_', ...buildData.projects.map((p) => `projects/${p.slug}`)],
  },
  { path: '/admin', element: <AdminPage />, entry: 'src/pages/AdminPage.tsx' },
];

import type { RouteRecord } from 'vite-react-ssg';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';

export const routes: RouteRecord[] = [
  { path: '/', element: <HomePage />, entry: 'src/pages/HomePage.tsx' },
  {
    path: '/projects/:slug',
    element: <ProjectPage />,
    entry: 'src/pages/ProjectPage.tsx',
    // Published slugs are fetched at build time in the deploy pipeline (phase 6).
    getStaticPaths: () => [],
  },
  { path: '/admin', element: <AdminPage />, entry: 'src/pages/AdminPage.tsx' },
];

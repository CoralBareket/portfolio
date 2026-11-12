import type { RouteRecord } from 'vite-react-ssg';
import { HomePage } from './pages/HomePage';

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <HomePage />,
    entry: 'src/pages/HomePage.tsx',
  },
];

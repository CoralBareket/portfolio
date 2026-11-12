import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './styles/index.css';

/** Pre-rendered to static HTML at build time, hydrated in the browser. */
export const createRoot = ViteReactSSG({ routes });

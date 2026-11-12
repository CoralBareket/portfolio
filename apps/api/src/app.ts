import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { publicRoutes } from './routes/public.routes';

/** Builds the API. Runtime-agnostic: used by the local Node server, tests and the Vercel function. */
export function createApp() {
  const app = new Hono().basePath('/api');
  app.use('*', requestLogger);
  app.use('*', secureHeaders());
  app.route('/', publicRoutes);
  app.notFound(notFoundHandler);
  app.onError(errorHandler);
  return app;
}

export type AppType = ReturnType<typeof createApp>;

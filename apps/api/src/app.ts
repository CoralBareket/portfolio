import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import { AppError } from './lib/errors';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { adminRoutes } from './routes/admin.routes';
import { publicRoutes } from './routes/public.routes';

/** Builds the API. Runtime-agnostic: used by the local Node server, tests and the Vercel function. */
export function createApp() {
  const app = new Hono().basePath('/api');
  app.use('*', requestLogger);
  app.use('*', secureHeaders());
  app.use(
    '*',
    bodyLimit({
      maxSize: 256 * 1024,
      onError: () => {
        throw new AppError(413, 'payload_too_large', 'Request body is too large');
      },
    }),
  );
  app.route('/', publicRoutes);
  app.route('/admin', adminRoutes);
  app.notFound(notFoundHandler);
  app.onError(errorHandler);
  return app;
}

export type AppType = ReturnType<typeof createApp>;

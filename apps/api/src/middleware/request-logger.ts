import type { MiddlewareHandler } from 'hono';
import { logger } from '../lib/logger';

/** One structured log line per request: method, path, status, duration. */
export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = performance.now();
  await next();
  logger.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      ms: Math.round(performance.now() - start),
    },
    'request',
  );
};

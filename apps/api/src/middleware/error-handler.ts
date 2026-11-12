import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ApiError } from '@portfolio/shared';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json<ApiError>(
      { error: { code: err.code, message: err.message, details: err.details } },
      err.status,
    );
  }
  if (err instanceof HTTPException) {
    return c.json<ApiError>({ error: { code: 'http_error', message: err.message } }, err.status);
  }
  logger.error({ err, path: c.req.path, method: c.req.method }, 'unhandled error');
  return c.json<ApiError>({ error: { code: 'internal', message: 'Something went wrong' } }, 500);
};

export const notFoundHandler: NotFoundHandler = (c) =>
  c.json<ApiError>(
    { error: { code: 'not_found', message: `No route for ${c.req.method} ${c.req.path}` } },
    404,
  );

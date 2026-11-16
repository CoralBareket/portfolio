import type { ContentfulStatusCode } from 'hono/utils/http-status';

/** Errors thrown by services; the central handler turns them into the `{ error }` envelope. */
export class AppError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (what: string) => new AppError(404, 'not_found', `${what} not found`);
export const notConfigured = (what: string) =>
  new AppError(503, 'not_configured', `${what} is not configured (see .env.example)`);

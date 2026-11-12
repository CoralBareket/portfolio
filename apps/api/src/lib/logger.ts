import pino from 'pino';
import { env, isProd } from './env';

/** Structured JSON logs in production (readable in Vercel logs), pretty logs in dev. */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'portfolio-api' },
  redact: ['req.headers.authorization', '*.email', '*.message'],
  ...(isProd || env.NODE_ENV === 'test'
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }),
});

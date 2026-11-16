import pino from 'pino';
import { env, isProd } from './env';

/** Structured JSON logs in production (readable in Vercel logs), pretty logs in dev. */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'portfolio-api' },
  // Never log secrets or visitors' personal data.
  redact: ['req.headers.authorization', 'contact.email', 'contact.message', 'mail.to', 'mail.replyTo'],
  ...(isProd || env.NODE_ENV === 'test'
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }),
});

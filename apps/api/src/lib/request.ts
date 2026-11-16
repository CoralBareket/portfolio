import type { Context } from 'hono';

/** Client IP as seen by Vercel's edge. Used only transiently (hashed for rate limiting). */
export function clientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || c.req.header('x-real-ip') || '127.0.0.1';
}

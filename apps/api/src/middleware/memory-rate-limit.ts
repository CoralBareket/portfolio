import { createMiddleware } from 'hono/factory';
import { AppError } from '../lib/errors';
import { clientIp } from '../lib/request';

/**
 * Best-effort, per-instance sliding window (Vercel reuses warm instances). Costs no
 * database operations, which is the point: it guards the free Firestore write quota.
 */
export function memoryRateLimit({ max, windowMs }: { max: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  return createMiddleware(async (c, next) => {
    const now = Date.now();
    const key = clientIp(c);
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) throw new AppError(429, 'rate_limited', 'Too many requests');
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // bound memory under abuse
    await next();
  });
}

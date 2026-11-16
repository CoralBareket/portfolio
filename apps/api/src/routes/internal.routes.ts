import { Hono } from 'hono';
import { env } from '../lib/env';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { maintenanceRepository } from '../repositories/maintenance.repository';

/** Jobs called by Vercel Cron (once a day on the Hobby plan). */
export const internalRoutes = new Hono().get('/cron/cleanup', async (c) => {
  if (!env.CRON_SECRET || c.req.header('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
    throw new AppError(401, 'unauthenticated', 'Invalid cron secret');
  }
  const rateLimits = await maintenanceRepository.deleteExpiredRateLimits();
  logger.info({ rateLimits }, 'cleanup done');
  return c.json({ deleted: { rateLimits } });
});

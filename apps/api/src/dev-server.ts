import { serve } from '@hono/node-server';
import { createApp } from './app';
import { logger } from './lib/logger';

const port = Number(process.env.API_PORT ?? 8787);

serve({ fetch: createApp().fetch, port }, (info) => {
  logger.info(`API listening on http://localhost:${info.port}/api`);
});

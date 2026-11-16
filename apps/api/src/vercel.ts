import { getRequestListener } from '@hono/node-server';
import { createApp } from './app';

/**
 * Vercel Function entry (Node.js launcher, `(req, res)` signature).
 * Bundled by scripts/build-vercel.ts into `.vercel/output/functions/api.func/index.mjs`.
 * Vercel rewrites every `/api/*` request here and keeps the original URL, so Hono routes as usual.
 */
export default getRequestListener(createApp().fetch);

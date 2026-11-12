import { Hono } from 'hono';
import { z } from 'zod';
import { contactInputSchema } from '@portfolio/shared';
import { clientIp } from '../lib/request';
import { validate } from '../middleware/validate';
import { contactService } from '../services/contact.service';
import { contentService } from '../services/content.service';
import { cvService } from '../services/cv.service';
import { projectsService } from '../services/projects.service';

/** Cached at Vercel's CDN, so most visits cost zero Firestore reads. */
const CDN_CACHE = 'public, s-maxage=300, stale-while-revalidate=86400';

export const publicRoutes = new Hono()
  .get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))

  .get('/content', async (c) => {
    c.header('Cache-Control', CDN_CACHE);
    return c.json(await contentService.getPublicPayload());
  })

  .get('/projects/:slug', validate('param', z.object({ slug: z.string().min(1).max(80) })), async (c) => {
    c.header('Cache-Control', CDN_CACHE);
    return c.json({ project: await projectsService.getPublishedBySlug(c.req.valid('param').slug) });
  })

  .get('/cv', async (c) => {
    const url = await cvService.downloadUrl();
    c.header('Cache-Control', 'no-store'); // every download must reach the function to be counted
    return c.redirect(url, 302);
  })

  .post('/contact', validate('json', contactInputSchema), async (c) => {
    await contactService.submit(c.req.valid('json'), clientIp(c));
    return c.json({ ok: true }, 201);
  });

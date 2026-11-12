import { Hono } from 'hono';
import { contentService } from '../services/content.service';

export const publicRoutes = new Hono()
  .get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))
  .get('/content', async (c) => {
    const content = await contentService.getSiteContent();
    // Cached at Vercel's CDN, so most visits cost zero Firestore reads.
    c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return c.json({ content });
  });

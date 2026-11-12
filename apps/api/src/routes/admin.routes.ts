import { Hono } from 'hono';
import { z } from 'zod';
import {
  cvInputSchema,
  messageUpdateSchema,
  projectInputSchema,
  siteContentSchema,
  uploadSignRequestSchema,
} from '@portfolio/shared';
import { createUploadSignature } from '../lib/cloudinary';
import { requireAdmin, type AdminVariables } from '../middleware/require-admin';
import { validate } from '../middleware/validate';
import { contentService } from '../services/content.service';
import { cvService } from '../services/cv.service';
import { messagesService } from '../services/messages.service';
import { projectsService } from '../services/projects.service';

const idParam = validate('param', z.object({ id: z.string().min(1).max(128) }));

export const adminRoutes = new Hono<{ Variables: AdminVariables }>()
  .use('*', requireAdmin)
  .use('*', async (c, next) => {
    await next();
    c.header('Cache-Control', 'no-store');
  })

  .get('/me', (c) => c.json({ admin: c.get('admin') }))

  // Site content
  .get('/content', async (c) => c.json({ content: await contentService.getSiteContent() }))
  .put('/content', validate('json', siteContentSchema), async (c) =>
    c.json({ content: await contentService.updateSiteContent(c.req.valid('json')) }),
  )

  // Projects
  .get('/projects', async (c) => c.json({ projects: await projectsService.listAll() }))
  .post('/projects', validate('json', projectInputSchema), async (c) =>
    c.json({ project: await projectsService.create(c.req.valid('json')) }, 201),
  )
  .put('/projects/:id', idParam, validate('json', projectInputSchema), async (c) =>
    c.json({ project: await projectsService.update(c.req.valid('param').id, c.req.valid('json')) }),
  )
  .delete('/projects/:id', idParam, async (c) => {
    await projectsService.remove(c.req.valid('param').id);
    return c.body(null, 204);
  })

  // Uploads (signed, browser → Cloudinary directly)
  .post('/uploads/sign', validate('json', uploadSignRequestSchema), (c) =>
    c.json(createUploadSignature(c.req.valid('json').kind)),
  )

  // CV
  .get('/cv', async (c) => c.json({ cv: await cvService.get() }))
  .put('/cv', validate('json', cvInputSchema), async (c) =>
    c.json({ cv: await cvService.replace(c.req.valid('json')) }),
  )

  // Contact inbox
  .get('/messages', async (c) => c.json(await messagesService.inbox()))
  .patch('/messages/:id', idParam, validate('json', messageUpdateSchema), async (c) =>
    c.json({ message: await messagesService.setStatus(c.req.valid('param').id, c.req.valid('json').status) }),
  );

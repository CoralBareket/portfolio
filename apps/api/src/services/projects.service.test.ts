import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectInputSchema } from '@portfolio/shared';

const repo = { findBySlug: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };
const destroyAsset = vi.fn();
vi.mock('../repositories/projects.repository', () => ({ projectsRepository: repo }));
vi.mock('../lib/cloudinary', async (orig) => ({ ...(await orig<object>()), destroyAsset }));

const { projectsService } = await import('./projects.service');

const input = projectInputSchema.parse({ slug: 'my-app', title: 'My App' });
const cover = (id: string) => ({
  url: `https://res.cloudinary.com/demo-cloud/image/upload/v1/portfolio-dev/projects/${id}.png`,
  publicId: `portfolio-dev/projects/${id}`,
});

describe('projectsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refuses a slug used by another project (409)', async () => {
    repo.findBySlug.mockResolvedValue({ id: 'other', slug: 'my-app' });
    await expect(projectsService.create(input)).rejects.toMatchObject({ status: 409 });
  });

  it('refuses cover images that are not ours (400)', async () => {
    repo.findBySlug.mockResolvedValue(null);
    const bad = { ...input, cover: { url: 'https://evil.example/x.png', publicId: 'x' } };
    await expect(projectsService.create(bad)).rejects.toMatchObject({ status: 400 });
  });

  it('deletes the old cover from Cloudinary when it is replaced', async () => {
    repo.findById.mockResolvedValue({ ...input, id: 'p1', cover: cover('old') });
    repo.findBySlug.mockResolvedValue({ id: 'p1' });
    repo.update.mockResolvedValue({ ...input, id: 'p1', cover: cover('new') });
    await projectsService.update('p1', { ...input, cover: cover('new') });
    expect(destroyAsset).toHaveBeenCalledWith('portfolio-dev/projects/old');
  });

  it('hides unpublished projects from the public (404)', async () => {
    repo.findBySlug.mockResolvedValue({ ...input, id: 'p1', published: false });
    await expect(projectsService.getPublishedBySlug('my-app')).rejects.toMatchObject({ status: 404 });
  });
});

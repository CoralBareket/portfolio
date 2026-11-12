import type { Project, ProjectInput } from '@portfolio/shared';
import { destroyAsset, isOwnAsset } from '../lib/cloudinary';
import { AppError, notFound } from '../lib/errors';
import { projectsRepository } from '../repositories/projects.repository';

async function assertValid(input: ProjectInput, currentId?: string) {
  const sameSlug = await projectsRepository.findBySlug(input.slug);
  if (sameSlug && sameSlug.id !== currentId) {
    throw new AppError(409, 'slug_taken', `Another project already uses the slug "${input.slug}"`);
  }
  if (input.cover && !isOwnAsset(input.cover.url, input.cover.publicId, 'image')) {
    throw new AppError(400, 'invalid_cover', 'Cover image must be uploaded through the admin panel');
  }
}

export const projectsService = {
  listAll: () => projectsRepository.listAll(),

  async getPublishedBySlug(slug: string): Promise<Project> {
    const project = await projectsRepository.findBySlug(slug);
    if (!project?.published) throw notFound('Project');
    return project;
  },

  async create(input: ProjectInput): Promise<Project> {
    await assertValid(input);
    return projectsRepository.create(input);
  },

  async update(id: string, input: ProjectInput): Promise<Project> {
    const existing = await projectsRepository.findById(id);
    if (!existing) throw notFound('Project');
    await assertValid(input, id);
    const updated = await projectsRepository.update(id, input);
    if (existing.cover && existing.cover.publicId !== input.cover?.publicId) {
      await destroyAsset(existing.cover.publicId);
    }
    return updated;
  },

  async remove(id: string): Promise<void> {
    const existing = await projectsRepository.findById(id);
    if (!existing) throw notFound('Project');
    await projectsRepository.delete(id);
    if (existing.cover) await destroyAsset(existing.cover.publicId);
  },
};

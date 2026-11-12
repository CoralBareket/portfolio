import { defaultContent, type PublicContentResponse, type SiteContent } from '@portfolio/shared';
import { getFirebase } from '../lib/firebase';
import { contentRepository } from '../repositories/content.repository';
import { cvRepository } from '../repositories/cv.repository';
import { projectsRepository } from '../repositories/projects.repository';

export const contentService = {
  /** Falls back to the CV defaults so the public site never breaks on an empty database. */
  async getSiteContent(): Promise<SiteContent> {
    return (await contentRepository.get()) ?? defaultContent;
  },

  /** Everything the public page needs, in one CDN-cacheable response. */
  async getPublicPayload(): Promise<PublicContentResponse> {
    if (!getFirebase()) return { content: defaultContent, projects: [], cvAvailable: false };
    const [content, projects, cv] = await Promise.all([
      this.getSiteContent(),
      projectsRepository.listPublished(),
      cvRepository.get(),
    ]);
    return { content, projects, cvAvailable: cv !== null };
  },

  async updateSiteContent(content: SiteContent): Promise<SiteContent> {
    await contentRepository.set(content);
    return content;
  },
};

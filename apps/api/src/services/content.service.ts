import { defaultContent, type SiteContent } from '@portfolio/shared';
import { contentRepository } from '../repositories/content.repository';

export const contentService = {
  /** Falls back to the CV defaults so the public site never breaks on an empty database. */
  async getSiteContent(): Promise<SiteContent> {
    return (await contentRepository.get()) ?? defaultContent;
  },
};

import type { CvInfo } from '@portfolio/shared';
import { attachmentUrl, destroyAsset, isOwnAsset } from '../lib/cloudinary';
import { AppError, notFound } from '../lib/errors';
import { logger } from '../lib/logger';
import { cvRepository } from '../repositories/cv.repository';
import { statsRepository } from '../repositories/stats.repository';

export const cvService = {
  get: () => cvRepository.get(),

  /** Counts the download and returns where to redirect the browser. */
  async downloadUrl(): Promise<string> {
    const cv = await cvRepository.get();
    if (!cv) throw notFound('CV');
    await statsRepository.increment({ cvDownloads: 1 }).catch((err) => logger.warn({ err }, 'stats failed'));
    return attachmentUrl(cv.url, cv.fileName);
  },

  async replace(input: Omit<CvInfo, 'uploadedAt'>): Promise<CvInfo | null> {
    if (!isOwnAsset(input.url, input.publicId, 'cv')) {
      throw new AppError(400, 'invalid_cv', 'The CV must be uploaded through the admin panel');
    }
    const previous = await cvRepository.get();
    await cvRepository.set(input);
    if (previous && previous.publicId !== input.publicId) await destroyAsset(previous.publicId);
    return cvRepository.get();
  },
};

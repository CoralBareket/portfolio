import { defaultContent, type PublicContentResponse } from '@portfolio/shared';

/**
 * Content snapshot taken from Firestore right before a production build
 * (scripts/fetch-build-data.ts). Missing in local dev → the CV defaults.
 */
const files = import.meta.glob<PublicContentResponse>('../generated/build-data.json', {
  eager: true,
  import: 'default',
});

export const buildData: PublicContentResponse = Object.values(files)[0] ?? {
  content: defaultContent,
  projects: [],
  cvAvailable: false,
};

/**
 * Snapshots the public content from Firestore into apps/web/src/generated/build-data.json,
 * so the production build pre-renders the CURRENT hero/about/projects (SEO + link previews).
 * Without Firebase credentials it writes the CV defaults instead.
 *   pnpm tsx --env-file=.env.production.local scripts/fetch-build-data.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { getFirestore } from 'firebase-admin/firestore';
import {
  defaultContent,
  siteContentSchema,
  type Project,
  type PublicContentResponse,
} from '../packages/shared/src/index';
import { initAdmin } from './firebase-admin';

const OUT = 'apps/web/src/generated/build-data.json';

async function load(): Promise<PublicContentResponse> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    console.warn('! No Firebase credentials: building with the built-in CV content.');
    return { content: defaultContent, projects: [], cvAvailable: false };
  }
  const db = getFirestore(initAdmin());
  const [site, projects, cv] = await Promise.all([
    db.collection('content').doc('site').get(),
    db.collection('projects').where('published', '==', true).get(),
    db.collection('cv').doc('current').get(),
  ]);
  const parsed = siteContentSchema.safeParse(site.data());
  return {
    content: parsed.success ? parsed.data : defaultContent,
    projects: projects.docs
      .map((d) => {
        const data = d.data();
        const updatedAt = data.updatedAt?.toDate?.().toISOString() ?? '';
        return { ...data, id: d.id, updatedAt } as Project;
      })
      .sort((a, b) => a.order - b.order),
    cvAvailable: cv.exists,
  };
}

const data = await load();
mkdirSync('apps/web/src/generated', { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(
  `✓ Build data: ${data.projects.length} published project(s), CV ${data.cvAvailable ? 'yes' : 'no'}`,
);

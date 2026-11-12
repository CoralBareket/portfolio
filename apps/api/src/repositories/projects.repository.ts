import type { Timestamp } from 'firebase-admin/firestore';
import { FieldValue, type DocumentSnapshot } from 'firebase-admin/firestore';
import type { Project, ProjectInput } from '@portfolio/shared';
import { requireDb } from '../lib/firebase';

const col = () => requireDb().collection('projects');

function toProject(snap: DocumentSnapshot): Project {
  const data = snap.data() as ProjectInput & { updatedAt?: Timestamp };
  return { ...data, id: snap.id, updatedAt: data.updatedAt?.toDate().toISOString() ?? '' };
}

const byOrder = (a: Project, b: Project) => a.order - b.order || a.title.localeCompare(b.title);

/** Portfolios hold a handful of projects, so sorting in memory avoids composite indexes. */
export const projectsRepository = {
  async listAll(): Promise<Project[]> {
    const snap = await col().get();
    return snap.docs.map(toProject).sort(byOrder);
  },
  async listPublished(): Promise<Project[]> {
    const snap = await col().where('published', '==', true).get();
    return snap.docs.map(toProject).sort(byOrder);
  },
  async findById(id: string): Promise<Project | null> {
    const snap = await col().doc(id).get();
    return snap.exists ? toProject(snap) : null;
  },
  async findBySlug(slug: string): Promise<Project | null> {
    const snap = await col().where('slug', '==', slug).limit(1).get();
    const doc = snap.docs[0];
    return doc ? toProject(doc) : null;
  },
  async create(input: ProjectInput): Promise<Project> {
    const ref = await col().add({ ...input, updatedAt: FieldValue.serverTimestamp() });
    return toProject(await ref.get());
  },
  async update(id: string, input: ProjectInput): Promise<Project> {
    const ref = col().doc(id);
    await ref.set({ ...input, updatedAt: FieldValue.serverTimestamp() });
    return toProject(await ref.get());
  },
  async delete(id: string): Promise<void> {
    await col().doc(id).delete();
  },
};

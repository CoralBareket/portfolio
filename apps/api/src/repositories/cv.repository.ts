import type { Timestamp } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { CvInfo } from '@portfolio/shared';
import { getFirebase, requireDb } from '../lib/firebase';

const ref = () => requireDb().collection('cv').doc('current');

export const cvRepository = {
  async get(): Promise<CvInfo | null> {
    if (!getFirebase()) return null;
    const snap = await ref().get();
    if (!snap.exists) return null;
    const data = snap.data() as Omit<CvInfo, 'uploadedAt'> & { uploadedAt?: Timestamp };
    return { ...data, uploadedAt: data.uploadedAt?.toDate().toISOString() ?? '' };
  },
  async set(input: Omit<CvInfo, 'uploadedAt'>): Promise<void> {
    await ref().set({ ...input, uploadedAt: FieldValue.serverTimestamp() });
  },
};

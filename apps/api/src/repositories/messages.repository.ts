import type { Timestamp } from 'firebase-admin/firestore';
import { FieldValue, type DocumentSnapshot } from 'firebase-admin/firestore';
import type { ContactMessage, MessageStatus } from '@portfolio/shared';
import { requireDb } from '../lib/firebase';

const col = () => requireDb().collection('messages');

function toMessage(snap: DocumentSnapshot): ContactMessage {
  const data = snap.data() as Omit<ContactMessage, 'id' | 'createdAt'> & { createdAt?: Timestamp };
  return { ...data, id: snap.id, createdAt: data.createdAt?.toDate().toISOString() ?? '' };
}

export const messagesRepository = {
  async create(input: { name: string; email: string; message: string }): Promise<string> {
    const ref = await col().add({ ...input, status: 'unread', createdAt: FieldValue.serverTimestamp() });
    return ref.id;
  },
  /** Newest first. Single-field ordering, so no composite index is needed. */
  async listRecent(limit = 200): Promise<ContactMessage[]> {
    const snap = await col().orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map(toMessage);
  },
  /** Aggregation query: billed as one read per 1,000 matching index entries. */
  async countUnread(): Promise<number> {
    const snap = await col().where('status', '==', 'unread').count().get();
    return snap.data().count;
  },
  async setStatus(id: string, status: MessageStatus): Promise<ContactMessage | null> {
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;
    await ref.update({ status });
    return toMessage(await ref.get());
  },
};

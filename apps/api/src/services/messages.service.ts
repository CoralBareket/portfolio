import type { MessageStatus } from '@portfolio/shared';
import { notFound } from '../lib/errors';
import { messagesRepository } from '../repositories/messages.repository';

export const messagesService = {
  async inbox() {
    const [messages, unread] = await Promise.all([
      messagesRepository.listRecent(),
      messagesRepository.countUnread(),
    ]);
    return { messages, unread };
  },
  async setStatus(id: string, status: MessageStatus) {
    const updated = await messagesRepository.setStatus(id, status);
    if (!updated) throw notFound('Message');
    return updated;
  },
};

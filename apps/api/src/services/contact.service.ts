import { createHash } from 'node:crypto';
import type { ContactInput } from '@portfolio/shared';
import { env } from '../lib/env';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { contactNotification, sendMail } from '../lib/mailer';
import { verifyTurnstile } from '../lib/turnstile';
import { messagesRepository } from '../repositories/messages.repository';
import { rateLimitRepository } from '../repositories/rate-limit.repository';
import { statsRepository } from '../repositories/stats.repository';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Salted hash, so rate-limit keys can't be turned back into an IP address. */
const ipKey = (ip: string) =>
  createHash('sha256').update(`${env.RATE_LIMIT_SALT}:${ip}`).digest('hex').slice(0, 32);

export type ContactResult = { status: 'sent' } | { status: 'dropped' };

export const contactService = {
  async submit(input: ContactInput, ip: string): Promise<ContactResult> {
    // Honeypot filled in: pretend it worked, store nothing.
    if (input.website) {
      logger.info('contact honeypot triggered');
      return { status: 'dropped' };
    }

    if (!(await verifyTurnstile(input.turnstileToken, ip))) {
      throw new AppError(400, 'captcha_failed', 'Captcha verification failed. Please try again.');
    }

    const [perIp, global] = await Promise.all([
      rateLimitRepository.hit(`contact_ip_${ipKey(ip)}`, HOUR),
      rateLimitRepository.hit('contact_global', DAY),
    ]);
    if (perIp > env.CONTACT_MAX_PER_HOUR || global > env.CONTACT_MAX_PER_DAY) {
      throw new AppError(
        429,
        'rate_limited',
        'Too many messages. Please try again later or email me directly.',
      );
    }

    const { name, email, message } = input;
    await messagesRepository.create({ name, email, message });
    await statsRepository
      .increment({ contacts: 1 })
      .catch((err) => logger.warn({ err }, 'stats increment failed'));

    // The message is already saved, so an email failure must not fail the request.
    try {
      await sendMail({ to: env.CONTACT_TO_EMAIL, ...contactNotification({ name, email, message }) });
    } catch (err) {
      logger.error({ err }, 'contact email failed (message is saved in the inbox)');
    }
    return { status: 'sent' };
  },
};

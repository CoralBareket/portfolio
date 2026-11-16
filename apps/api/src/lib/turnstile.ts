import { env } from './env';
import { logger } from './logger';

/** Server-side Cloudflare Turnstile check. Fails closed: any error means "not verified". */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) logger.warn({ codes: data['error-codes'] }, 'turnstile rejected');
    return data.success === true;
  } catch (err) {
    logger.error({ err }, 'turnstile verification failed');
    return false;
  }
}

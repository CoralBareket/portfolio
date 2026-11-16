import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();
const hit = vi.fn();
const increment = vi.fn();
const sendMail = vi.fn();
const verifyTurnstile = vi.fn();

vi.mock('../repositories/messages.repository', () => ({ messagesRepository: { create } }));
vi.mock('../repositories/rate-limit.repository', () => ({ rateLimitRepository: { hit } }));
vi.mock('../repositories/stats.repository', () => ({ statsRepository: { increment } }));
vi.mock('../lib/turnstile', () => ({ verifyTurnstile }));
vi.mock('../lib/mailer', async (orig) => ({ ...(await orig<object>()), sendMail }));

const { contactService } = await import('./contact.service');

const input = {
  name: 'Dana',
  email: 'dana@example.com',
  message: 'Hi Coral, I would love to talk about a role.',
  turnstileToken: 'token',
};

describe('contactService.submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyTurnstile.mockResolvedValue(true);
    hit.mockResolvedValue(1);
    increment.mockResolvedValue(undefined);
    sendMail.mockResolvedValue(undefined);
  });

  it('saves the message and emails it with Reply-To set to the sender', async () => {
    await expect(contactService.submit(input, '1.2.3.4')).resolves.toEqual({ status: 'sent' });
    expect(create).toHaveBeenCalledWith({ name: 'Dana', email: 'dana@example.com', message: input.message });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'coral.bareket@gmail.com', replyTo: 'dana@example.com' }),
    );
    expect(increment).toHaveBeenCalledWith({ contacts: 1 });
  });

  it('silently drops honeypot submissions', async () => {
    await expect(contactService.submit({ ...input, website: 'spam' }, '1.2.3.4')).resolves.toEqual({
      status: 'dropped',
    });
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a failed captcha with 400', async () => {
    verifyTurnstile.mockResolvedValue(false);
    await expect(contactService.submit(input, '1.2.3.4')).rejects.toMatchObject({ status: 400 });
    expect(create).not.toHaveBeenCalled();
  });

  it('rate-limits with 429 and never stores the raw IP', async () => {
    hit.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    await expect(contactService.submit(input, '1.2.3.4')).rejects.toMatchObject({ status: 429 });
    const keys = hit.mock.calls.map((call) => call[0] as string);
    expect(keys.join()).not.toContain('1.2.3.4');
  });

  it('keeps the message even if the email provider fails', async () => {
    sendMail.mockRejectedValue(new Error('resend down'));
    await expect(contactService.submit(input, '1.2.3.4')).resolves.toEqual({ status: 'sent' });
    expect(create).toHaveBeenCalled();
  });
});

import { env } from './env';
import { logger } from './logger';

export type Mail = { to: string; replyTo?: string; subject: string; text: string; html: string };

/**
 * Sends email through Resend's REST API. Without RESEND_API_KEY (local development)
 * the email is logged instead, so nothing leaves the machine.
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.info(
      { mail: { to: mail.to, replyTo: mail.replyTo, subject: mail.subject } },
      'email (dev: not sent)',
    );
    logger.debug(mail.text);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [mail.to],
      reply_to: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

export function contactNotification(input: {
  name: string;
  email: string;
  message: string;
}): Omit<Mail, 'to'> {
  return {
    replyTo: input.email,
    subject: `New portfolio message from ${input.name}`,
    text: `From: ${input.name} <${input.email}>\n\n${input.message}\n\nReply to this email to answer directly.`,
    html: `<div style="font-family:system-ui,sans-serif;line-height:1.5">
<p><strong>From:</strong> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</p>
<p style="white-space:pre-wrap;border-left:3px solid #F5A524;padding-left:12px">${escapeHtml(input.message)}</p>
<p style="color:#777;font-size:13px">Reply to this email to answer directly.</p></div>`,
  };
}

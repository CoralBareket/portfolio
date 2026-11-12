import { Mail, Send } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { contactInputSchema } from '@portfolio/shared';
import { Reveal } from '../components/Reveal';
import { Turnstile, type TurnstileHandle } from '../components/Turnstile';
import { GithubIcon, LinkedinIcon } from '../components/icons';
import { useContent } from '../lib/content';

const fieldsSchema = contactInputSchema.pick({ name: true, email: true, message: true });
type Field = 'name' | 'email' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'error' | 'captcha' | 'limited';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text placeholder:text-muted/70 focus:border-accent focus:outline-none';

export function Contact() {
  const { content } = useContent();
  const { links } = content;
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [captchaToken, setCaptchaToken] = useState('');
  const captcha = useRef<TurnstileHandle>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const parsed = fieldsSchema.safeParse(data);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        next[key] ??=
          key === 'email'
            ? 'Please enter a valid email address.'
            : key === 'message'
              ? 'Please write at least 10 characters.'
              : 'Please enter your name.';
      }
      setErrors(next);
      return;
    }
    setErrors({});
    if (!captchaToken) {
      setStatus('captcha');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, website: data.website ?? '', turnstileToken: captchaToken }),
      });
      if (res.status === 429) setStatus('limited');
      else if (!res.ok) throw new Error(String(res.status));
      else {
        setStatus('sent');
        form.reset();
      }
    } catch {
      setStatus('error');
    } finally {
      // Tokens are single-use: get a fresh one for any further message.
      captcha.current?.reset();
    }
  }

  const contactLinks = [
    { href: links.linkedin, label: 'LinkedIn', icon: <LinkedinIcon size={18} />, text: 'coral-bareket' },
    {
      href: `mailto:${links.email}`,
      label: 'Email',
      icon: <Mail size={18} aria-hidden="true" />,
      text: links.email,
    },
    { href: links.github, label: 'GitHub', icon: <GithubIcon size={18} />, text: 'CoralBareket' },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
      <Reveal>
        <p className="text-lg leading-relaxed text-muted">
          Have a role, a project or a question? Send me a message or reach out directly.
        </p>
        <ul className="mt-8 space-y-3">
          {contactLinks.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  {l.icon}
                </span>
                <span>
                  <span className="block font-mono text-xs text-muted">{l.label}</span>
                  <span className="break-all group-hover:text-accent">{l.text}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.1}>
        <form
          noValidate
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-surface p-6 sm:p-8"
          aria-describedby="contact-status"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {(['name', 'email'] as const).map((field) => (
              <div key={field}>
                <label htmlFor={`contact-${field}`} className="font-mono text-sm">
                  {field === 'name' ? 'Name' : 'Email'}
                </label>
                <input
                  id={`contact-${field}`}
                  name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  autoComplete={field}
                  required
                  aria-invalid={errors[field] ? true : undefined}
                  aria-describedby={errors[field] ? `contact-${field}-error` : undefined}
                  className={inputClass}
                />
                {errors[field] && (
                  <p id={`contact-${field}-error`} className="mt-1.5 text-sm text-red-300">
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5">
            <label htmlFor="contact-message" className="font-mono text-sm">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className={`${inputClass} resize-y`}
            />
            {errors.message && (
              <p id="contact-message-error" className="mt-1.5 text-sm text-red-300">
                {errors.message}
              </p>
            )}
          </div>

          {/* Honeypot: hidden from people and screen readers, irresistible to bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="mt-5">
            <Turnstile ref={captcha} onToken={setCaptchaToken} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-bg transition hover:brightness-110 disabled:opacity-60"
            >
              <Send size={18} aria-hidden="true" /> {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <p id="contact-status" role="status" className="text-sm">
              {status === 'sent' && (
                <span className="text-accent">Thanks! I&apos;ll get back to you soon.</span>
              )}
              {status === 'captcha' && (
                <span className="text-red-300">Please complete the quick check above first.</span>
              )}
              {status === 'limited' && (
                <span className="text-red-300">
                  Too many messages for now. Please email me at {links.email}.
                </span>
              )}
              {status === 'error' && (
                <span className="text-red-300">
                  Couldn&apos;t send right now. Please email me at {links.email}.
                </span>
              )}
            </p>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

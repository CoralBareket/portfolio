import { ArrowRight, Mail } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { contactInputSchema } from '@portfolio/shared';
import { GithubIcon, LinkedinIcon } from '../components/icons';
import { Turnstile, type TurnstileHandle } from '../components/Turnstile';
import { useContent } from '../lib/content';

const fieldsSchema = contactInputSchema.pick({ name: true, email: true, message: true });
type Field = 'name' | 'email' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'error' | 'captcha' | 'limited';

const inputClass =
  'mt-2 w-full rounded-md border border-rule bg-bg px-3.5 py-2.5 text-[16px] text-text transition-colors placeholder:text-faint focus:border-accent focus:outline-none focus-visible:outline-none';

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

  const elsewhere = [
    { href: `mailto:${links.email}`, label: 'Email', aria: `Email ${links.email}`, icon: <Mail size={16} /> },
    {
      href: links.linkedin,
      label: 'LinkedIn',
      aria: 'LinkedIn: in/coral-bareket',
      icon: <LinkedinIcon size={16} />,
    },
    {
      href: links.github,
      label: 'GitHub',
      aria: 'GitHub: github.com/CoralBareket',
      icon: <GithubIcon size={16} />,
    },
  ];

  const field = (name: Field, label: string, input: React.ReactNode) => (
    <div>
      <label htmlFor={`contact-${name}`} className="label">
        {label}
      </label>
      {input}
      {errors[name] && (
        <p id={`contact-${name}-error`} className="mt-2 text-sm text-red-300">
          {errors[name]}
        </p>
      )}
    </div>
  );
  const aria = (name: Field) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mx-auto max-w-[44ch] text-center text-lg leading-relaxed text-muted">
        Got a problem worth solving? Whatever the stack, I&apos;d like to hear about it.
      </p>
      <ul className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        {elsewhere.map((l) => {
          const external = !l.href.startsWith('mailto:');
          return (
            <li key={l.label}>
              <a
                href={l.href}
                aria-label={l.aria}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="btn btn-ghost w-full min-w-[140px]"
              >
                <span aria-hidden="true">{l.icon}</span>
                {l.label}
              </a>
            </li>
          );
        })}
      </ul>

      <form
        noValidate
        onSubmit={onSubmit}
        aria-describedby="contact-status"
        className="card relative mt-12 space-y-6 p-6 text-left sm:p-8"
      >
        <p className="label">Or send a message</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {field(
            'name',
            'Name',
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={inputClass}
              {...aria('name')}
            />,
          )}
          {field(
            'email',
            'Email',
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              {...aria('email')}
            />,
          )}
        </div>
        {field(
          'message',
          'Message',
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            className={`${inputClass} resize-y`}
            {...aria('message')}
          />,
        )}

        {/* Honeypot: hidden from people and screen readers, irresistible to bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <Turnstile ref={captcha} onToken={setCaptchaToken} />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn btn-primary group disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
          <p id="contact-status" role="status" className="text-sm">
            {status === 'sent' && <span className="text-teal">Thanks! I&apos;ll get back to you soon.</span>}
            {status === 'captcha' && (
              <span className="text-red-300">
                Still checking you&apos;re not a bot. Please try again in a moment.
              </span>
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
    </div>
  );
}

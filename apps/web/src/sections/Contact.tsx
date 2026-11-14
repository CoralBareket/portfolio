import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { contactInputSchema } from '@portfolio/shared';
import { Turnstile, type TurnstileHandle } from '../components/Turnstile';
import { useContent } from '../lib/content';

const fieldsSchema = contactInputSchema.pick({ name: true, email: true, message: true });
type Field = 'name' | 'email' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'error' | 'captcha' | 'limited';

/** Underline-only fields, like filling in a form on a printed sheet. */
const inputClass =
  'mt-2 w-full border-0 border-b border-rule bg-transparent px-0 py-2 text-[17px] text-text transition-colors placeholder:text-faint focus:border-accent focus:outline-none focus-visible:outline-none';

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
    { href: links.linkedin, label: 'LinkedIn', text: 'in/coral-bareket' },
    { href: links.github, label: 'GitHub', text: 'github.com/CoralBareket' },
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
    <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      <div>
        <p className="max-w-[28ch] font-serif text-[1.9rem] leading-[1.18] sm:text-[2.3rem]">
          Have a role, a project or a question? I&apos;d like to hear about it.
        </p>
        <a
          href={`mailto:${links.email}`}
          aria-label={`Email ${links.email}`}
          className="group mt-8 inline-flex items-center gap-2 text-lg break-all sm:text-xl"
        >
          <span className="link">{links.email}</span>
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
        <dl className="mt-10 border-b border-border">
          {elsewhere.map((l) => (
            <div key={l.label} className="grid grid-cols-[110px_1fr] border-t border-border py-4">
              <dt className="label pt-[3px]">{l.label}</dt>
              <dd>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${l.label}: ${l.text}`}
                  className="link"
                >
                  {l.text}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <form noValidate onSubmit={onSubmit} aria-describedby="contact-status" className="relative space-y-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
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
            className="group inline-flex items-center gap-2 border border-accent px-5 py-2.5 font-medium text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
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
    </div>
  );
}

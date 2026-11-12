import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

const control =
  'mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none';

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs text-muted">
        {label}
      </label>
      <input id={id} className={control} {...props} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs text-muted">
        {label}
      </label>
      <textarea id={id} className={`${control} resize-y`} {...props} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        className="size-4 accent-[var(--color-accent)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-accent text-bg hover:brightness-110',
    ghost: 'border border-border hover:border-accent hover:text-accent',
    danger: 'border border-red-400/40 text-red-300 hover:bg-red-400/10',
  }[variant];
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Card({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-semibold">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Notice({ kind, children }: { kind: 'error' | 'success'; children: ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded-lg px-3 py-2 text-sm ${
        kind === 'error' ? 'bg-red-400/10 text-red-300' : 'bg-accent-soft text-accent'
      }`}
    >
      {children}
    </p>
  );
}

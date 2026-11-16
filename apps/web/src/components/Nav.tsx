import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActiveSection } from '../lib/useActiveSection';
import type { SectionDef } from '../lib/site';

type Props = { name: string; title: string; sections: (SectionDef & { number: string })[] };

export function Nav({ name, title, sections }: Props) {
  const active = useActiveSection(sections.map((s) => s.id));
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('');

  const links = sections.map((s) => {
    const isActive = active === s.id;
    return (
      <li key={s.id}>
        <a
          href={`#${s.id}`}
          onClick={() => setOpen(false)}
          aria-current={isActive ? 'location' : undefined}
          className={`relative flex items-center gap-2 py-2.5 font-mono text-[12px] transition-colors hover:text-text ${
            isActive ? 'text-text' : 'text-muted'
          }`}
        >
          <span className={isActive ? 'text-accent' : 'text-faint'}>{s.number}</span>
          {s.label}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0.5 hidden h-px bg-accent lg:block"
            />
          )}
        </a>
      </li>
    );
  });

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-border bg-bg/85 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav aria-label="Main" className="container-page flex h-16 items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 whitespace-nowrap">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-linear-135 from-accent to-teal text-[12px] font-bold tracking-tight text-bg"
          >
            {initials}
          </span>
          <span className="text-[15px] font-semibold tracking-tight">{name}</span>
          <span className="hidden text-[14px] text-muted sm:inline">· {title}</span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">{links}</ul>

        <button
          type="button"
          className="-mr-2 p-2 text-muted hover:text-text lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="container-page border-t border-border py-3 lg:hidden">
          {links}
        </ul>
      )}
    </header>
  );
}

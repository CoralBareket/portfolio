import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActiveSection } from '../lib/useActiveSection';
import type { SectionDef } from '../lib/site';
import { LocalTime } from './LocalTime';

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

  const links = sections.map((s) => {
    const isActive = active === s.id;
    return (
      <li key={s.id}>
        <a
          href={`#${s.id}`}
          onClick={() => setOpen(false)}
          aria-current={isActive ? 'location' : undefined}
          className={`group flex items-center gap-2 py-2 font-mono text-[12px] tracking-wide transition-colors hover:text-text ${
            isActive ? 'text-text' : 'text-muted'
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 transition-colors ${isActive ? 'bg-accent' : 'bg-transparent group-hover:bg-rule'}`}
          />
          <span className={isActive ? 'text-accent' : 'text-faint'}>{s.number}</span>
          {s.label}
        </a>
      </li>
    );
  });

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-border bg-bg/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8"
      >
        <a href="#top" className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-[15px] font-medium tracking-tight">{name}</span>
          <span className="hidden font-serif text-[17px] text-muted italic sm:inline">{title}</span>
        </a>

        <ul className="hidden items-center gap-5 lg:flex">{links}</ul>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
            <LocalTime />
          </span>
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
        </div>
      </nav>

      {open && (
        <ul id="mobile-menu" className="border-t border-border px-5 py-3 sm:px-8 lg:hidden">
          {links}
        </ul>
      )}
    </header>
  );
}

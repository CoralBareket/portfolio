import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActiveSection } from '../lib/useActiveSection';
import type { SectionDef } from '../lib/site';

type Props = { sections: (SectionDef & { number: string })[] };

export function Nav({ sections }: Props) {
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
          className={`block rounded-md px-3 py-2 font-mono text-sm transition-colors hover:text-text ${
            isActive ? 'text-accent' : 'text-muted'
          }`}
        >
          <span className="text-accent/70">{s.number}.</span> {s.label}
        </a>
      </li>
    );
  });

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled || open ? 'border-border bg-bg/85 backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8"
      >
        <a href="#top" className="font-mono text-base font-bold">
          <span className="text-accent">&gt;</span> coral<span className="text-accent">.</span>bareket
        </a>

        <ul className="hidden items-center gap-1 md:flex">{links}</ul>

        <button
          type="button"
          className="rounded-md p-2 text-muted hover:text-text md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="border-t border-border px-4 py-3 md:hidden">
          {links}
        </ul>
      )}
    </header>
  );
}

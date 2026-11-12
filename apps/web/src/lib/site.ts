/** Public site URL. One place to change when a custom domain is added. */
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://coralbareket.vercel.app';

export type SectionId = 'stack' | 'focus' | 'experience' | 'projects' | 'about' | 'contact';

export type SectionDef = { id: SectionId; label: string; slug: string };

const ALL_SECTIONS: SectionDef[] = [
  { id: 'stack', label: 'Stack', slug: 'tech_stack' },
  { id: 'focus', label: 'Focus', slug: 'engineering_focus' },
  { id: 'experience', label: 'Experience', slug: 'experience' },
  { id: 'projects', label: 'Projects', slug: 'projects' },
  { id: 'about', label: 'About', slug: 'about' },
  { id: 'contact', label: 'Contact', slug: 'contact' },
];

/** Visible sections, numbered 01, 02, … after hidden ones are removed. */
export function visibleSections(hideProjects: boolean) {
  return ALL_SECTIONS.filter((s) => !(hideProjects && s.id === 'projects')).map((s, i) => ({
    ...s,
    number: String(i + 1).padStart(2, '0'),
  }));
}

import { describe, expect, it } from 'vitest';
import { visibleSections } from './site';

describe('visibleSections', () => {
  it('drops the projects section and renumbers when hidden', () => {
    const sections = visibleSections(true);
    expect(sections.map((s) => s.id)).not.toContain('projects');
    expect(sections.find((s) => s.id === 'about')?.number).toBe('04');
    expect(sections.at(-1)?.number).toBe('05');
  });

  it('keeps all six sections otherwise', () => {
    expect(visibleSections(false)).toHaveLength(6);
  });
});

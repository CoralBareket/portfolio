import { describe, expect, it } from 'vitest';
import {
  contactInputSchema,
  defaultContent,
  eventBatchSchema,
  projectInputSchema,
  siteContentSchema,
} from './index';

describe('shared schemas', () => {
  it('default content is valid', () => {
    expect(siteContentSchema.safeParse(defaultContent).success).toBe(true);
  });

  it('rejects a filled honeypot on the contact form', () => {
    const result = contactInputSchema.safeParse({
      name: 'Bot',
      email: 'bot@example.com',
      message: 'Buy cheap things now!!',
      website: 'http://spam.example',
      turnstileToken: 'x',
    });
    expect(result.success).toBe(false);
  });

  it('rejects slugs with spaces or capitals', () => {
    expect(projectInputSchema.safeParse({ slug: 'My Project', title: 'x' }).success).toBe(false);
    expect(projectInputSchema.safeParse({ slug: 'my-project', title: 'x' }).success).toBe(true);
  });

  it('caps event batches at 30 events', () => {
    const events = Array.from({ length: 31 }, () => ({ type: 'pageview' as const, path: '/' }));
    expect(eventBatchSchema.safeParse({ firstVisitToday: true, isNewVisitor: true, events }).success).toBe(
      false,
    );
  });
});

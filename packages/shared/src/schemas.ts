import { z } from 'zod';

/** Site-wide editable content, stored in Firestore at `content/site`. */
export const skillGroupSchema = z.object({
  name: z.string().min(1).max(60),
  items: z.array(z.string().min(1).max(60)).max(40),
});

export const experienceSchema = z.object({
  role: z.string().min(1).max(120),
  company: z.string().min(1).max(120),
  companyDescription: z.string().max(200).default(''),
  period: z.string().min(1).max(40),
  highlight: z.string().max(200).default(''),
  bullets: z.array(z.string().min(1).max(300)).max(20),
});

export const focusAreaSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(400),
  tags: z.array(z.string().max(40)).max(12),
});

export const siteContentSchema = z.object({
  hero: z.object({
    name: z.string().min(1).max(80),
    title: z.string().min(1).max(80),
    tagline: z.string().min(1).max(200),
    location: z.string().max(80),
    chips: z.array(z.string().max(40)).max(12),
  }),
  summary: z.string().max(800),
  skills: z.array(skillGroupSchema).max(10),
  focusAreas: z.array(focusAreaSchema).max(6),
  experience: z.array(experienceSchema).max(10),
  about: z.object({
    paragraphs: z.array(z.string().min(1).max(800)).max(8),
    education: z.object({ degree: z.string(), school: z.string(), period: z.string() }),
    service: z.array(z.object({ role: z.string(), org: z.string(), period: z.string() })).max(6),
    languages: z.array(z.object({ name: z.string(), level: z.string() })).max(6),
  }),
  links: z.object({
    linkedin: z.url(),
    github: z.url(),
    email: z.email(),
  }),
  settings: z.object({
    /** Hide the projects section and its nav link entirely (instead of the "coming soon" state). */
    hideProjects: z.boolean(),
  }),
});
export type SiteContent = z.infer<typeof siteContentSchema>;

/** Portfolio project, stored at `projects/{id}`. */
export const projectInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, numbers and dashes only'),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(160).default(''),
  description: z.string().max(600).default(''),
  problem: z.string().max(2000).default(''),
  approach: z.string().max(2000).default(''),
  keyDecisions: z.array(z.string().min(1).max(300)).max(12).default([]),
  architecture: z
    .array(z.object({ step: z.string().min(1).max(60), detail: z.string().max(200).default('') }))
    .max(10)
    .default([]),
  tags: z.array(z.string().min(1).max(40)).max(16).default([]),
  repoUrl: z.url().or(z.literal('')).default(''),
  demoUrl: z.url().or(z.literal('')).default(''),
  cover: z.object({ url: z.url(), publicId: z.string() }).nullable().default(null),
  order: z.number().int().min(0).max(1000).default(0),
  published: z.boolean().default(false),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type Project = ProjectInput & { id: string; updatedAt: string };

/**
 * Contact form. `website` is a honeypot: humans never fill it in. It is accepted by the schema
 * (so bots get a normal-looking success) and silently dropped by the service.
 */
export const contactInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(500).optional(),
  turnstileToken: z.string().min(1).max(4096),
});
export type ContactInput = z.infer<typeof contactInputSchema>;

export const messageStatuses = ['unread', 'read', 'archived'] as const;
export type MessageStatus = (typeof messageStatuses)[number];
export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
};
export const messageUpdateSchema = z.object({ status: z.enum(messageStatuses) });

/** The current CV file (stored at `cv/current`). */
export const cvInputSchema = z.object({
  url: z.url(),
  publicId: z.string().min(1).max(300),
  fileName: z.string().min(1).max(200),
});
export type CvInfo = z.infer<typeof cvInputSchema> & { uploadedAt: string };

/** Admin asks the API for a signed, direct-to-Cloudinary upload. */
export const uploadKinds = ['image', 'cv'] as const;
export const uploadSignRequestSchema = z.object({ kind: z.enum(uploadKinds) });
export type UploadSignature = {
  uploadUrl: string;
  fields: Record<string, string>;
};

/** Public payload of GET /api/content. */
export type PublicContentResponse = {
  content: SiteContent;
  projects: Project[];
  cvAvailable: boolean;
};

/** First-party analytics batch, sent with navigator.sendBeacon to POST /api/events. */
export const clickTargets = ['linkedin', 'github', 'email', 'repo', 'demo', 'cv'] as const;
export const analyticsEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pageview'), path: z.string().max(200) }),
  z.object({ type: z.literal('section_view'), section: z.string().max(40) }),
  z.object({ type: z.literal('click'), target: z.enum(clickTargets) }),
]);
export const eventBatchSchema = z.object({
  /** True the first time this browser is seen today (Israel time), so uniques need no DB read. */
  firstVisitToday: z.boolean(),
  isNewVisitor: z.boolean(),
  referrer: z.string().max(300).default(''),
  utmSource: z.string().max(60).default(''),
  events: z.array(analyticsEventSchema).min(1).max(30),
});
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type EventBatch = z.infer<typeof eventBatchSchema>;

/** API error envelope used by every endpoint. */
export type ApiError = { error: { code: string; message: string; details?: unknown } };

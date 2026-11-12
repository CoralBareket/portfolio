import { z } from 'zod';

/** Cloudflare's documented test secret: every token passes. Used only outside production. */
export const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA';

const optional = z
  .string()
  .optional()
  .transform((v) => (v ? v : undefined));

/**
 * Typed, validated environment. Local development uses a separate free "dev" Firebase
 * project (or no Firebase at all), so it can never touch production data.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    FIREBASE_PROJECT_ID: z.string().default('demo-portfolio'),
    /** Base64-encoded service-account JSON. */
    FIREBASE_SERVICE_ACCOUNT_B64: optional,
    FIRESTORE_EMULATOR_HOST: optional,
    FIREBASE_AUTH_EMULATOR_HOST: optional,

    /** Without a key, emails are logged instead of sent (development). */
    RESEND_API_KEY: optional,
    CONTACT_TO_EMAIL: z.email().default('coral.bareket@gmail.com'),
    CONTACT_FROM_EMAIL: z.string().default('Portfolio Contact <onboarding@resend.dev>'),

    CLOUDINARY_CLOUD_NAME: optional,
    CLOUDINARY_API_KEY: optional,
    CLOUDINARY_API_SECRET: optional,
    /** Keeps dev uploads apart from production uploads in the same Cloudinary account. */
    CLOUDINARY_FOLDER: z.string().default('portfolio-dev'),

    TURNSTILE_SECRET_KEY: z.string().default(TURNSTILE_TEST_SECRET),
    RATE_LIMIT_SALT: z.string().default('dev-only-salt'),
    CONTACT_MAX_PER_HOUR: z.coerce.number().int().positive().default(3),
    CONTACT_MAX_PER_DAY: z.coerce.number().int().positive().default(20),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV !== 'production') return;
    const required: (keyof typeof e)[] = [
      'FIREBASE_SERVICE_ACCOUNT_B64',
      'RESEND_API_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ];
    for (const key of required) {
      if (!e[key]) ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required in production` });
    }
    if (e.TURNSTILE_SECRET_KEY === TURNSTILE_TEST_SECRET)
      ctx.addIssue({
        code: 'custom',
        path: ['TURNSTILE_SECRET_KEY'],
        message: 'Use the real Turnstile secret',
      });
    if (e.RATE_LIMIT_SALT === 'dev-only-salt')
      ctx.addIssue({ code: 'custom', path: ['RATE_LIMIT_SALT'], message: 'Set a random RATE_LIMIT_SALT' });
    if (e.CLOUDINARY_FOLDER === 'portfolio-dev')
      ctx.addIssue({
        code: 'custom',
        path: ['CLOUDINARY_FOLDER'],
        message: 'Set CLOUDINARY_FOLDER=portfolio',
      });
  });

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';

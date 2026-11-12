import { z } from 'zod';

/**
 * Typed, validated environment. In development the API talks only to the Firebase emulators
 * (project `demo-portfolio`), so it can never touch production data.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  FIREBASE_PROJECT_ID: z.string().default('demo-portfolio'),
  /** Base64-encoded service-account JSON. Production only (Vercel env var). */
  FIREBASE_SERVICE_ACCOUNT_B64: z.string().optional(),
  FIRESTORE_EMULATOR_HOST: z.string().optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';

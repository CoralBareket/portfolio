/**
 * One-time (and re-runnable) production setup on Vercel, via the REST API:
 *   - creates the project WITHOUT a Git connection (so nothing ever auto-deploys)
 *   - puts functions in fra1 (Frankfurt, next to Firestore europe-west3)
 *   - stores runtime env vars (secrets as "sensitive", never readable again)
 *   - prints the IDs GitHub Actions needs
 *
 *   pnpm setup:production        (reads .env.production.local, which is git-ignored)
 * Values are sent to Vercel only and are never printed.
 */
import { randomBytes } from 'node:crypto';

const API = 'https://api.vercel.com';
const token = process.env.VERCEL_TOKEN;
const projectName = process.env.VERCEL_PROJECT_NAME || 'coralbareket';

const required = [
  'VERCEL_TOKEN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_SERVICE_ACCOUNT_B64',
  'RESEND_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'TURNSTILE_SECRET_KEY',
] as const;
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing in .env.production.local: ${missing.join(', ')}`);
  process.exit(1);
}

async function vercel<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

// 1. Project (no gitRepository → never connected to GitHub → no automatic deployments)
type ProjectRes = { id: string; accountId: string; error?: { message: string } };
let project = await vercel<ProjectRes>('GET', `/v9/projects/${projectName}`);
if (project.status === 404) {
  project = await vercel<ProjectRes>('POST', '/v11/projects', {
    name: projectName,
    framework: null,
    serverlessFunctionRegion: 'fra1',
    previewDeploymentsDisabled: true,
  });
  if (project.status >= 300) throw new Error(`Create project failed: ${project.data.error?.message}`);
  console.log(`✓ Created Vercel project "${projectName}"`);
} else if (project.status >= 300) {
  throw new Error(`Could not read project: ${project.data.error?.message}`);
} else {
  await vercel('PATCH', `/v9/projects/${project.data.id}`, { serverlessFunctionRegion: 'fra1' });
  console.log(`✓ Project "${projectName}" exists`);
}
const { id: projectId, accountId } = project.data;

// 2. Runtime environment variables (production only)
const secret = () => randomBytes(32).toString('base64url');
/** Value of a required key (presence was checked at startup). */
const need = (key: (typeof required)[number]): string => process.env[key] ?? '';
const env: [key: string, value: string, sensitive: boolean][] = [
  ['LOG_LEVEL', 'info', false],
  ['FIREBASE_PROJECT_ID', need('FIREBASE_PROJECT_ID'), false],
  ['FIREBASE_SERVICE_ACCOUNT_B64', need('FIREBASE_SERVICE_ACCOUNT_B64'), true],
  ['RESEND_API_KEY', need('RESEND_API_KEY'), true],
  ['CONTACT_TO_EMAIL', process.env.CONTACT_TO_EMAIL || 'coral.bareket@gmail.com', false],
  ['CLOUDINARY_CLOUD_NAME', need('CLOUDINARY_CLOUD_NAME'), false],
  ['CLOUDINARY_API_KEY', need('CLOUDINARY_API_KEY'), false],
  ['CLOUDINARY_API_SECRET', need('CLOUDINARY_API_SECRET'), true],
  ['CLOUDINARY_FOLDER', 'portfolio', false],
  ['TURNSTILE_SECRET_KEY', need('TURNSTILE_SECRET_KEY'), true],
  ['RATE_LIMIT_SALT', process.env.RATE_LIMIT_SALT || secret(), true],
  ['CRON_SECRET', process.env.CRON_SECRET || secret(), true],
];
const res = await vercel<{ failed?: { error: { key?: string; message: string } }[] }>(
  'POST',
  `/v10/projects/${projectId}/env?upsert=true`,
  env.map(([key, value, sensitive]) => ({
    key,
    value,
    type: sensitive ? 'sensitive' : 'encrypted',
    target: ['production'],
  })),
);
if (res.status >= 300 || res.data.failed?.length) {
  console.error(
    'Some env vars failed:',
    res.data.failed?.map((f) => `${f.error.key}: ${f.error.message}`),
  );
  process.exit(1);
}
console.log(`✓ ${env.length} production env vars stored on Vercel`);

console.log(`
Add these to GitHub → repo Settings → Secrets and variables → Actions:

  Secrets:   VERCEL_ORG_ID      = ${accountId}
             VERCEL_PROJECT_ID  = ${projectId}
             VERCEL_TOKEN       (the same token as in .env.production.local)
             FIREBASE_SERVICE_ACCOUNT_B64 (same as in .env.production.local)
  Variables: FIREBASE_PROJECT_ID, VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
             VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID, VITE_TURNSTILE_SITE_KEY
`);

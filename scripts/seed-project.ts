/**
 * Adds a project from `scripts/projects/<slug>.json` (+ optional `<slug>.png` cover) to Firestore,
 * the same way the admin panel would: the cover goes to Cloudinary under
 * `<CLOUDINARY_FOLDER>/projects/<id>`, so the API accepts it as one of its own assets.
 *   pnpm seed:project tower-hop            (dev project, .env.local)
 *   pnpm seed:project tower-hop --force    (overwrite the existing project with that slug)
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { projectInputSchema } from '../packages/shared/src/index';
import { initAdmin } from './firebase-admin';

const slug = process.argv[2];
const force = process.argv.includes('--force');
if (!slug || slug.startsWith('-')) fail('Usage: pnpm seed:project <slug> [--force]');

const dir = resolve(import.meta.dirname, 'projects');
const jsonPath = `${dir}/${slug}.json`;
const coverPath = `${dir}/${slug}.png`;
if (!existsSync(jsonPath)) fail(`${jsonPath} not found.`);

const rawInput = JSON.parse(readFileSync(jsonPath, 'utf8')) as Record<string, unknown>;
const input = projectInputSchema.parse(rawInput);
if (input.slug !== slug) fail(`The file's slug is "${input.slug}", expected "${slug}".`);
const todo = findTodo(input);
if (todo) fail(`${todo} still has a TODO placeholder.`);

const col = getFirestore(initAdmin()).collection('projects');
const existing = (await col.where('slug', '==', slug).limit(1).get()).docs[0];
if (existing && !force) {
  console.log(`Project "${slug}" already exists (${existing.id}); use --force to overwrite it.`);
  process.exit(0);
}
const ref = existing?.ref ?? col.doc();

const previous = (existing?.get('cover') ?? null) as { publicId: string } | null;
// A PNG next to the JSON wins; otherwise the file's own `cover`, otherwise keep the current one.
const cover = existsSync(coverPath)
  ? await uploadCover(coverPath, ref.id)
  : 'cover' in rawInput
    ? input.cover
    : previous;
await ref.set({ ...input, cover, updatedAt: FieldValue.serverTimestamp() });
console.log(`✓ ${existing ? 'Updated' : 'Created'} projects/${ref.id} → /projects/${slug}`);
// Same clean-up as the admin panel: a replaced or removed cover is deleted from Cloudinary.
if (previous && previous.publicId !== cover?.publicId) await destroyAsset(previous.publicId);

/** Path of the first string (at any depth) that is still a TODO placeholder. */
function findTodo(value: unknown, path = 'input'): string | null {
  if (typeof value === 'string') return value.startsWith('TODO') ? path : null;
  if (Array.isArray(value)) return value.map((v, i) => findTodo(v, `${path}[${i}]`)).find(Boolean) ?? null;
  if (value && typeof value === 'object') {
    return (
      Object.entries(value)
        .map(([k, v]) => findTodo(v, `${path}.${k}`))
        .find(Boolean) ?? null
    );
  }
  return null;
}

function cloudinary() {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey } = process.env;
  const { CLOUDINARY_API_SECRET: apiSecret, CLOUDINARY_FOLDER: folder } = process.env;
  if (!cloudName || !apiKey || !apiSecret || !folder) {
    fail('CLOUDINARY_CLOUD_NAME, _API_KEY, _API_SECRET and _FOLDER must be set.');
  }
  /** Request fields signed the same way as signParams() in apps/api/src/lib/cloudinary.ts. */
  const signed = (params: Record<string, string>) => {
    const all = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
    const payload = Object.keys(all)
      .sort()
      .map((k) => `${k}=${all[k as keyof typeof all]}`)
      .join('&');
    const signature = createHash('sha1')
      .update(payload + apiSecret)
      .digest('hex');
    return { ...all, api_key: apiKey, signature };
  };
  return { base: `https://api.cloudinary.com/v1_1/${cloudName}/image`, folder, signed };
}

/** Best-effort delete of a replaced cover; a failure only leaves an unused image behind. */
async function destroyAsset(publicId: string) {
  const { base, signed } = cloudinary();
  const res = await fetch(`${base}/destroy`, {
    method: 'POST',
    body: new URLSearchParams(signed({ public_id: publicId })),
  });
  console.log(res.ok ? `✓ Deleted old cover ${publicId}` : `! Could not delete old cover ${publicId}`);
}

/** Signed upload with a fixed public id, overwriting the previous cover of this project. */
async function uploadCover(path: string, id: string) {
  const { base, folder, signed } = cloudinary();
  const form = new FormData();
  const fields = signed({ invalidate: 'true', overwrite: 'true', public_id: `${folder}/projects/${id}` });
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  form.append('file', new Blob([readFileSync(path)], { type: 'image/png' }), `${slug}.png`);
  const res = await fetch(`${base}/upload`, {
    method: 'POST',
    body: form,
  });
  const body = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message: string } };
  if (!res.ok || !body.secure_url || !body.public_id)
    fail(`Cover upload failed: ${body.error?.message ?? res.status}`);
  console.log(`✓ Uploaded cover → ${body.public_id}`);
  return { url: body.secure_url, publicId: body.public_id };
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

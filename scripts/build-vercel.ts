/**
 * Produces a complete Vercel deployment in `.vercel/output` (Build Output API v3):
 *   1. snapshot public content from Firestore (for pre-rendering)
 *   2. build + pre-render the web app
 *   3. bundle the API into one Node.js Function (region fra1, next to Firestore)
 *   4. write routing, security headers (CSP with inline-script hashes), clean URLs and the daily cron
 * Deployed with `vercel deploy --prebuilt --prod` by .github/workflows/deploy.yml.
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildApi } from './build-api';

const OUT = '.vercel/output';
const STATIC = `${OUT}/static`;
const FUNC = `${OUT}/functions/api.func`;
const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://coralbareket.vercel.app').replace(/\/$/, '');

const run = (cmd: string) => execSync(cmd, { stdio: 'inherit', env: process.env });

// In CI these are baked into the browser bundle. Missing ones would silently ship a site whose
// admin sign-in is off and whose contact form uses Turnstile's test key, so stop the deploy instead.
if (process.env.CI) {
  const publicVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_TURNSTILE_SITE_KEY',
  ];
  const missing = publicVars.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    console.error(
      `✗ Missing build variables: ${missing.join(', ')}.\n` +
        '  Add them under GitHub → Settings → Secrets and variables → Actions → *Variables* tab (not Secrets).',
    );
    process.exit(1);
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// 1–2. Content snapshot + web build
run('pnpm exec tsx scripts/fetch-build-data.ts');
run('pnpm --filter @portfolio/web build');

// 3. Static files
rmSync(OUT, { recursive: true, force: true });
mkdirSync(STATIC, { recursive: true });
cpSync('apps/web/dist', STATIC, { recursive: true, filter: (src) => !src.includes('/.vite') });

const htmlFiles = walk(STATIC)
  .filter((f) => f.endsWith('.html'))
  .map((f) => relative(STATIC, f));

// Clean URLs: /admin → admin.html, /projects/x → projects/x.html
const overrides = Object.fromEntries(
  htmlFiles
    .filter((f) => f !== 'index.html' && f !== '404.html' && !f.endsWith('/_.html'))
    .map((f) => [f, { path: f.replace(/\.html$/, '') }]),
);

// Sitemap with every pre-rendered public page
const publicPages = ['/', ...Object.values(overrides).map((o) => `/${o.path}`)].filter((p) => p !== '/admin');
writeFileSync(
  `${STATIC}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages
    .map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);

// CSP: allow exactly the inline scripts the pre-renderer emitted (by SHA-256), nothing else inline.
const inlineHashes = new Set<string>();
for (const file of htmlFiles) {
  const html = readFileSync(join(STATIC, file), 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs ?? '') || /application\/ld\+json/.test(attrs ?? '') || !body) continue;
    inlineHashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...inlineHashes].join(' ')} https://challenges.cloudflare.com https://apis.google.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://res.cloudinary.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.cloudinary.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://challenges.cloudflare.com",
  'frame-src https://challenges.cloudflare.com https://*.firebaseapp.com https://accounts.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': csp,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  // Firebase's Google sign-in popup needs to talk back to the opener window.
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

// 4. API function
mkdirSync(FUNC, { recursive: true });
const bytes = await buildApi(FUNC);
writeFileSync(
  `${FUNC}/.vc-config.json`,
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.mjs',
      launcherType: 'Nodejs',
      shouldAddHelpers: false,
      shouldAddSourcemapSupport: true,
      maxDuration: 15,
      regions: ['fra1'],
      environment: { NODE_ENV: 'production' },
    },
    null,
    2,
  ),
);

// 5. Routing
const config = {
  version: 3,
  routes: [
    {
      src: '^/assets/(.*)$',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    { src: '^/(.*)$', headers: securityHeaders, continue: true },
    { handle: 'filesystem' },
    { src: '^/api(?:/.*)?$', dest: '/api' },
    { src: '^/projects/[^/]+/?$', dest: '/projects/_.html' },
    { src: '^/(admin)/$', status: 308, headers: { Location: '/$1' } },
    { handle: 'error' },
    { src: '^/.*$', dest: '/404.html', status: 404 },
  ],
  overrides,
  crons: [{ path: '/api/cron/cleanup', schedule: '0 2 * * *' }],
};
writeFileSync(`${OUT}/config.json`, JSON.stringify(config, null, 2));

console.log(
  `✓ .vercel/output ready: ${htmlFiles.length} pages, ${inlineHashes.size} inline-script hashes, API ${(bytes / 1e6).toFixed(1)} MB`,
);

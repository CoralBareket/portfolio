/**
 * Renders the 1200×630 link-preview image (LinkedIn, WhatsApp, X…) from the hero content,
 * in the site's own colours and fonts, to apps/web/public/og.png.
 *   pnpm og
 */
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { defaultContent } from '../packages/shared/src/index';

const fonts = resolve('apps/web/node_modules/@fontsource-variable');
const sans = pathToFileURL(join(fonts, 'geist/files/geist-latin-wght-normal.woff2')).href;
const mono = pathToFileURL(join(fonts, 'geist-mono/files/geist-mono-latin-wght-normal.woff2')).href;
const { hero } = defaultContent;
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; src: url(${sans}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url(${mono}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #080a0e; color: #f0f4f8; font-family: Geist, sans-serif;
  position: relative; overflow: hidden; }
.grid { position: absolute; inset: 0;
  background-image: linear-gradient(rgb(106 168 255 / .06) 1px, transparent 1px),
    linear-gradient(90deg, rgb(106 168 255 / .06) 1px, transparent 1px);
  background-size: 40px 40px; mask-image: radial-gradient(circle at 80% 35%, #000 0, transparent 60%); }
.glow { position: absolute; width: 900px; height: 900px; right: -260px; top: -300px;
  background: radial-gradient(circle, rgb(56 132 244 / .26) 0, rgb(34 92 180 / .08) 40%, transparent 70%); }
.wrap { position: relative; padding: 72px 80px; height: 100%; display: flex; flex-direction: column; }
.logo { display: flex; align-items: center; gap: 14px; font-size: 22px; font-weight: 600; }
.mark { width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center; font-family: GeistMono;
  font-size: 17px; font-weight: 700; color: #080a0e; background: linear-gradient(135deg, #6aa8ff, #4fd1c5); }
.label { margin-top: 64px; font-family: GeistMono; font-size: 18px; letter-spacing: .14em; color: #959fac; text-transform: uppercase; }
h1 { margin-top: 14px; font-size: 112px; line-height: .95; font-weight: 600; letter-spacing: -.055em; }
.title { margin-top: 22px; font-size: 38px; font-weight: 500; color: #6aa8ff; letter-spacing: -.02em; }
.tagline { margin-top: 14px; font-size: 26px; color: #959fac; max-width: 780px; line-height: 1.4; }
.foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.chips { display: flex; gap: 10px; }
.chip { font-family: GeistMono; font-size: 17px; color: #c6ced8; border: 1px solid #2c3441; background: #0d1016;
  border-radius: 6px; padding: 8px 12px; }
.url { font-family: GeistMono; font-size: 19px; color: #4fd1c5; }
</style></head><body><div class="grid"></div><div class="glow"></div>
<div class="wrap">
  <div class="logo"><span class="mark">CB</span>${esc(hero.name)}</div>
  <p class="label">Portfolio</p>
  <h1>${esc(hero.name)}</h1>
  <p class="title">${esc(hero.title)}</p>
  <p class="tagline">${esc(hero.tagline)}</p>
  <div class="foot">
    <div class="chips">${hero.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>
    <span class="url">coralbareket.vercel.app</span>
  </div>
</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
const file = join(dir, 'og.html');
writeFileSync(file, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(file).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'apps/web/public/og.png' });
await browser.close();
console.log('✓ apps/web/public/og.png (1200×630)');

/**
 * Serves the production build (.vercel/output/static) the way Vercel does for the smoke tests:
 * same security headers (so CSP regressions fail the tests), clean URLs, project fallback and 404.
 * The API isn't running here; tests mock the endpoints they need.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import { extname, join } from 'node:path';

const OUT = '.vercel/output';
const STATIC = join(OUT, 'static');
const PORT = Number(process.env.PORT ?? 4319);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const fileFor = (pathname) => {
  const candidates = [
    pathname === '/' ? '/index.html' : pathname,
    `${pathname.replace(/\/$/, '')}.html`,
    /^\/projects\/[^/]+\/?$/.test(pathname) ? '/projects/_.html' : null,
  ].filter(Boolean);
  for (const c of candidates) {
    const file = join(STATIC, c);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
};

http
  .createServer((req, res) => {
    // Re-read per request so a rebuild never serves stale CSP hashes.
    const headers = JSON.parse(readFileSync(join(OUT, 'config.json'), 'utf8')).routes[1].headers;
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    if (pathname.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end('{"error":{"code":"not_mocked","message":"API not running in smoke tests"}}');
    }
    const file = fileFor(pathname);
    const status = file ? 200 : 404;
    const target = file ?? join(STATIC, '404.html');
    res.writeHead(status, {
      ...headers,
      'Content-Type': TYPES[extname(target)] ?? 'application/octet-stream',
    });
    res.end(readFileSync(target));
  })
  .listen(PORT, () => console.log(`smoke server on http://localhost:${PORT}`));

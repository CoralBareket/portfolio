import { config } from 'zod';

// Zod probes `new Function()` once to speed up parsing. The site's CSP (correctly) forbids eval,
// which makes browsers log a CSP violation, so use the eval-free code path everywhere.
// Imported first by index.ts: ES modules run their imports before their own body.
config({ jitless: true });

/**
 * Bundles the Hono API (with all dependencies) into one ESM file for a Vercel Node.js Function.
 *   pnpm tsx scripts/build-api.ts <outDir>
 */
import { build } from 'esbuild';

export async function buildApi(outDir: string): Promise<number> {
  const result = await build({
    entryPoints: ['apps/api/src/vercel.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    outfile: `${outDir}/index.mjs`,
    metafile: true,
    minify: true,
    sourcemap: 'linked',
    legalComments: 'none',
    logLevel: 'warning',
    // CommonJS dependencies (firebase-admin, google-gax…) expect these in scope.
    banner: {
      js: [
        "import { createRequire as __cr } from 'node:module';",
        "import { fileURLToPath as __fu } from 'node:url';",
        "import { dirname as __dn } from 'node:path';",
        'const require = __cr(import.meta.url);',
        'const __filename = __fu(import.meta.url);',
        'const __dirname = __dn(__filename);',
      ].join(' '),
    },
  });
  const output = Object.entries(result.metafile.outputs).find(([file]) => file.endsWith('.mjs'));
  return output?.[1].bytes ?? 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] ?? '.vercel/output/functions/api.func';
  const bytes = await buildApi(outDir);
  console.log(`✓ API bundled to ${outDir}/index.mjs (${(bytes / 1e6).toFixed(2)} MB)`);
}

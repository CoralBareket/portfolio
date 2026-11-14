import { execSync } from 'node:child_process';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/** Short commit hash for the footer's build stamp (GitHub Actions provides GITHUB_SHA). */
function commitHash(): string {
  try {
    return (process.env.GITHUB_SHA ?? execSync('git rev-parse HEAD').toString()).trim().slice(0, 7);
  } catch {
    return 'local';
  }
}

export default defineConfig({
  define: {
    __BUILD_COMMIT__: JSON.stringify(commitHash()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [react(), tailwindcss()],
  // One .env.local at the repo root serves both the API and the web app (only VITE_* reach the browser).
  envDir: '../..',
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    // Same-origin /api in dev too, just like production on Vercel.
    proxy: { '/api': 'http://localhost:8787' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});

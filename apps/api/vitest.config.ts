import { defineConfig } from 'vitest/config';

// Unit tests (src/) never touch a database. Integration tests (tests/) run under
// `firebase emulators:exec`, which sets FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST.
export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'fatal',
      FIREBASE_PROJECT_ID: 'demo-portfolio',
      CLOUDINARY_CLOUD_NAME: 'demo-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    },
  },
});

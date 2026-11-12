// jest-dom's bundled vitest types target the single-parameter `Assertion<T>` of older Vitest.
// Vitest 5 exposes `Matchers<R, T>` as the extension point, so register the DOM matchers there.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars -- declaration merging must repeat Vitest's exact type parameters */
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends TestingLibraryMatchers<any, R> {}
}

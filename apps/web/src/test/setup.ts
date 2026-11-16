import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(cleanup);

// jsdom has no IntersectionObserver (used by scroll reveals and the active-section nav).
class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

// The content provider refreshes from the API; tests use the pre-rendered content.
vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.reject(new Error('no network in tests'))),
);

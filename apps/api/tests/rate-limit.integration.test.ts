import { beforeEach, describe, expect, it } from 'vitest';
import { rateLimitRepository } from '../src/repositories/rate-limit.repository';
import { clearFirestore } from './helpers';

describe('rateLimitRepository (emulator)', () => {
  beforeEach(clearFirestore);

  it('counts hits atomically within a window and starts fresh in the next one', async () => {
    const hour = 60 * 60 * 1000;
    const t0 = Date.UTC(2026, 0, 1, 10, 5);
    const counts = await Promise.all([1, 2, 3].map(() => rateLimitRepository.hit('k', hour, t0)));
    expect(counts.sort()).toEqual([1, 2, 3]);
    expect(await rateLimitRepository.hit('k', hour, t0 + hour)).toBe(1);
  });
});

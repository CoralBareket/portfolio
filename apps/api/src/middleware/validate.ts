import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';
import type { ApiError } from '@portfolio/shared';

/** zod validation for any request part, answering in the standard `{ error }` envelope. */
export const validate = <Target extends keyof ValidationTargets, Schema extends ZodType>(
  target: Target,
  schema: Schema,
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return c.json<ApiError>(
        { error: { code: 'validation_error', message: 'Invalid request', details } },
        400,
      );
    }
  });

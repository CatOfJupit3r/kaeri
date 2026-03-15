import { ORPCError, implement } from '@orpc/server';

import { GAMIFICATION_CONTRACT } from '@kaeri/shared';

import type { Context } from '@~/loaders/hono.loader';

function serializeMongooseDocuments(data: unknown): unknown {
  if (data == null) return data;
  if (typeof data === 'object' && 'toObject' in data && typeof data.toObject === 'function') {
    return serializeMongooseDocuments(data.toObject());
  }
  if (Array.isArray(data)) return data.map((item) => serializeMongooseDocuments(item));
  if (typeof data === 'object' && data.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeMongooseDocuments(value);
    }
    return result;
  }
  return data;
}

const baseWithContext = implement(GAMIFICATION_CONTRACT)
  .$config({ initialOutputValidationIndex: Number.NaN })
  .$context<Context>();

const serializationMiddleware = baseWithContext.middleware(async ({ next }) => {
  const result = await next();
  return { ...result, output: serializeMongooseDocuments(result.output) };
});

const requireAuth = baseWithContext.middleware(async ({ context, next }) => {
  if (!context.session) {
    throw new ORPCError('UNAUTHORIZED', { message: 'User is not authenticated' });
  }
  return next({ context: { ...context, session: context.session } });
});

export const gamificationBase = baseWithContext.use(serializationMiddleware);
export const gamificationPublic = gamificationBase;
export const gamificationProtected = gamificationPublic.use(requireAuth);

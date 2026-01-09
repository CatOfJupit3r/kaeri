import { ORPCError, implement } from '@orpc/server';

import { CONTRACT } from '@kaeri/shared';

import type { Context } from '@~/loaders/hono.loader';

/**
 * Recursively converts Mongoose documents to plain objects.
 * This ensures that all responses are serializable and don't include
 * Mongoose-specific properties like methods and getters.
 */
function serializeMongooseDocuments(data: unknown): unknown {
  // Handle null/undefined
  if (data == null) return data;

  // Handle Mongoose documents (they have toObject method)
  if (typeof data === 'object' && 'toObject' in data && typeof data.toObject === 'function') {
    return serializeMongooseDocuments(data.toObject());
  }

  // Handle arrays
  if (Array.isArray(data)) return data.map((item) => serializeMongooseDocuments(item));

  // Handle plain objects
  if (typeof data === 'object' && data.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeMongooseDocuments(value);
    }
    return result;
  }

  // Return primitives as-is
  return data;
}

const baseWithContext = implement(CONTRACT)
  .$config({
    initialOutputValidationIndex: Number.NaN,
  })
  .$context<Context>();

// Apply serialization middleware to automatically convert Mongoose documents
const serializationMiddleware = baseWithContext.middleware(async ({ next }) => {
  const result = await next();
  // Wrap the output to transform it
  return {
    ...result,
    output: serializeMongooseDocuments(result.output),
  };
});

const requireAuth = baseWithContext.middleware(async ({ context, next }) => {
  if (!context.session) {
    throw new ORPCError('UNAUTHORIZED', { message: 'User is not authenticated' });
  }
  return next({
    context: {
      ...context,
      session: context.session,
    },
  });
});

export const base = baseWithContext.use(serializationMiddleware);

export const publicProcedure = base;

export const protectedProcedure = publicProcedure.use(requireAuth);

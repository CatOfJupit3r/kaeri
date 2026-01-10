import type z from 'zod';

/**
 * Extract the input type from a contract procedure's input schema.
 * Use this to derive service method parameter types from contract schemas.
 *
 * @example
 * ```ts
 * import { createSeriesInputSchema } from '@kaeri/shared/contract/series.contract';
 * type CreateSeriesInput = z.infer<typeof createSeriesInputSchema>;
 * ```
 */
export type InferInput<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * Omit server-managed fields from a schema type (like _id, timestamps, etc.)
 * Useful for create/update operations where these fields are auto-generated.
 */
export type OmitServerFields<T, K extends keyof T> = Omit<T, K>;

/**
 * Extract create input type by omitting _id and other server-managed fields.
 * Optionally omit additional fields specific to the entity.
 */
export type CreateInput<T extends z.ZodTypeAny, AdditionalOmits extends string = never> = Omit<
  z.infer<T>,
  '_id' | AdditionalOmits
>;

/**
 * Make all properties of a type optional for update operations.
 */
export type UpdateInput<T> = Partial<T>;

import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

// --- Shared Schemas ---

/**
 * Target type for presence tracking
 */
export const presenceTargetTypeSchema = z.enum(['series', 'script', 'scene']);
export const PRESENCE_TARGET_TYPES = presenceTargetTypeSchema.enum;
export type PresenceTargetType = z.infer<typeof presenceTargetTypeSchema>;

/**
 * Presence entry for a user
 */
export const presenceEntrySchema = z.object({
  userId: z.string(),
  targetType: presenceTargetTypeSchema,
  targetId: z.string(),
  /** Additional context like current page/view */
  context: z.string().optional(),
  lastSeen: z.coerce.date(),
  user: z
    .object({
      _id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    })
    .optional(),
});

export type PresenceEntry = z.infer<typeof presenceEntrySchema>;

/**
 * Aggregated presence for a target (series/script/scene)
 */
export const presenceAggregateSchema = z.object({
  targetType: presenceTargetTypeSchema,
  targetId: z.string(),
  users: z.array(presenceEntrySchema),
  count: z.number(),
});

export type PresenceAggregate = z.infer<typeof presenceAggregateSchema>;

// --- Input Schemas ---

const heartbeatInputSchema = z.object({
  /** Type of resource being viewed */
  targetType: presenceTargetTypeSchema,
  /** ID of the resource */
  targetId: z.string(),
  /** Optional context (e.g., "editing", "viewing") */
  context: z.string().max(50).optional(),
});

const getPresenceInputSchema = z.object({
  /** Type of resource to get presence for */
  targetType: presenceTargetTypeSchema,
  /** ID of the resource */
  targetId: z.string(),
});

const getSeriesPresenceInputSchema = z.object({
  seriesId: z.string(),
});

// --- Procedures ---

/**
 * Send heartbeat to indicate user is actively viewing a resource.
 * Should be called every 30 seconds to maintain presence.
 */
const heartbeat = authProcedure
  .route({
    path: '/heartbeat',
    method: 'POST',
    summary: 'Send presence heartbeat',
    description:
      'Sends a heartbeat to indicate the user is actively viewing a resource. Should be called every 30 seconds.',
  })
  .input(heartbeatInputSchema)
  .output(z.object({ success: z.boolean() }));

/**
 * Get users currently present on a specific resource
 */
const getPresence = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get presence for a resource',
    description: 'Returns list of users currently viewing a specific resource (series, script, or scene).',
  })
  .input(getPresenceInputSchema)
  .output(presenceAggregateSchema);

/**
 * Get all presence entries for a series (includes presence on scripts/scenes within)
 */
const getSeriesPresence = authProcedure
  .route({
    path: '/series',
    method: 'GET',
    summary: 'Get all presence for a series',
    description: 'Returns presence across a series and all its scripts/scenes. Useful for series dashboard.',
  })
  .input(getSeriesPresenceInputSchema)
  .output(
    z.object({
      /** Users viewing the series itself */
      series: presenceAggregateSchema.optional(),
      /** Users viewing scripts within the series */
      scripts: z.array(presenceAggregateSchema),
      /** Users viewing scenes within the series */
      scenes: z.array(presenceAggregateSchema),
      /** Total unique users across all targets */
      totalUniqueUsers: z.number(),
    }),
  );

/**
 * Clear user's presence (e.g., when leaving a page)
 */
const clearPresence = authProcedure
  .route({
    path: '/clear',
    method: 'DELETE',
    summary: 'Clear presence',
    description: 'Clears the user presence for a specific resource. Called when navigating away.',
  })
  .input(
    z.object({
      targetType: presenceTargetTypeSchema,
      targetId: z.string(),
    }),
  )
  .output(z.object({ success: z.boolean() }));

// --- Contract ---

const presenceContract = oc.prefix('/presence').router({
  heartbeat,
  getPresence,
  getSeriesPresence,
  clearPresence,
});

export default presenceContract;

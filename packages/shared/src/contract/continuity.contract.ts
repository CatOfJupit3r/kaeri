import { oc } from '@orpc/contract';
import z from 'zod';

import { appearanceSchema, characterSchema, locationSchema, propSchema } from './knowledge-base.contract';
import { authProcedure } from './procedures';
import { scriptSummarySchema } from './scripts.contract';

const timelineNodeSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  label: z.string(),
  order: z.number().optional(),
});

const continuityNodeSchema = z.discriminatedUnion('type', [
  characterSchema.extend({ type: z.literal('character') }),
  locationSchema.extend({ type: z.literal('location') }),
  propSchema.extend({ type: z.literal('prop') }),
  scriptSummarySchema.extend({ type: z.literal('script') }),
  timelineNodeSchema.extend({ type: z.literal('timeline') }),
]);

const continuityEdgeSchema = z.object({
  type: z.enum(['relationship', 'appearance', 'location-of', 'prop-in-scene']),
  fromId: z.string(),
  toId: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const auditEntrySchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  actorId: z.string(),
  timestamp: z.coerce.date(),
  before: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(),
});

const continuityGraph = authProcedure
  .route({
    path: '/graph',
    method: 'GET',
    summary: 'Continuity graph for a series',
    description: 'Returns nodes and edges linking characters, locations, props, scripts/scenes for a series.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(z.object({ nodes: z.array(continuityNodeSchema), edges: z.array(continuityEdgeSchema) }));

const appearancesByCharacter = authProcedure
  .route({
    path: '/appearances-by-character',
    method: 'GET',
    summary: 'Appearances for a character',
    description: 'Lists appearances for a character with scene references and optional location.',
  })
  .input(z.object({ seriesId: z.string(), characterId: z.string() }))
  .output(z.array(appearanceSchema));

const auditListByEntity = authProcedure
  .route({
    path: '/audit/by-entity',
    method: 'GET',
    summary: 'Audit log for an entity',
    description: 'Returns audit entries for a given entity within a series.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      entityType: z.string(),
      entityId: z.string(),
      offset: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(100).default(20),
    }),
  )
  .output(z.object({ items: z.array(auditEntrySchema), total: z.number() }));

const auditListBySeries = authProcedure
  .route({
    path: '/audit/by-series',
    method: 'GET',
    summary: 'Audit log for a series',
    description: 'Returns audit entries for a series with pagination.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      offset: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(100).default(20),
    }),
  )
  .output(z.object({ items: z.array(auditEntrySchema), total: z.number() }));

const continuityContract = oc.prefix('/continuity').router({
  continuityGraph,
  appearancesByCharacter,
  auditListByEntity,
  auditListBySeries,
});

export default continuityContract;
export { continuityNodeSchema, continuityEdgeSchema, auditEntrySchema, timelineNodeSchema };

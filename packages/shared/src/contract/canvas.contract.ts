import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const canvasNodeSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  type: z.enum(['text', 'shape', 'note']),
  content: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  style: z.record(z.string(), z.unknown()).optional(),
});

const canvasEdgeSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  label: z.string().optional(),
});

const getCanvas = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get canvas state',
    description: 'Returns all nodes and edges for a series canvas.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(z.object({ nodes: z.array(canvasNodeSchema), edges: z.array(canvasEdgeSchema) }));

const upsertNodes = authProcedure
  .route({
    path: '/upsert-nodes',
    method: 'POST',
    summary: 'Upsert canvas nodes',
    description: 'Creates or updates canvas nodes in bulk for a series.',
  })
  .input(z.object({ seriesId: z.string(), nodes: z.array(canvasNodeSchema) }))
  .output(z.array(canvasNodeSchema));

const upsertEdges = authProcedure
  .route({
    path: '/upsert-edges',
    method: 'POST',
    summary: 'Upsert canvas edges',
    description: 'Creates or updates canvas edges in bulk for a series.',
  })
  .input(z.object({ seriesId: z.string(), edges: z.array(canvasEdgeSchema) }))
  .output(z.array(canvasEdgeSchema));

const deleteNodes = authProcedure
  .route({
    path: '/delete-nodes',
    method: 'DELETE',
    summary: 'Delete canvas nodes',
    description: 'Deletes canvas nodes by ID.',
  })
  .input(z.object({ seriesId: z.string(), nodeIds: z.array(z.string()) }))
  .output(z.object({ success: z.boolean() }));

const deleteEdges = authProcedure
  .route({
    path: '/delete-edges',
    method: 'DELETE',
    summary: 'Delete canvas edges',
    description: 'Deletes canvas edges by ID.',
  })
  .input(z.object({ seriesId: z.string(), edgeIds: z.array(z.string()) }))
  .output(z.object({ success: z.boolean() }));

const canvasContract = oc.prefix('/canvas').router({
  getCanvas,
  upsertNodes,
  upsertEdges,
  deleteNodes,
  deleteEdges,
});

export default canvasContract;
export { canvasNodeSchema, canvasEdgeSchema };

import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

// Status enum for story arcs
export const storyArcStatusSchema = z.enum(['planned', 'in_progress', 'completed', 'abandoned']);
export const STORY_ARC_STATUS = storyArcStatusSchema.enum;

// Embedded schemas for nested objects
const arcBeatSchema = z.object({
  id: z.string(),
  order: z.number().int().min(0),
  description: z.string(),
  scriptId: z.string().optional(),
  sceneId: z.string().optional(),
});

const arcCharacterRoleSchema = z.object({
  characterId: z.string(),
  role: z.string(), // "protagonist", "antagonist", "catalyst", etc.
});

// Main Story Arc schema
export const storyArcSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  name: z.string(),
  description: z.string(),
  status: storyArcStatusSchema,
  startScriptId: z.string().optional(),
  endScriptId: z.string().optional(),
  keyBeats: z.array(arcBeatSchema),
  resolution: z.string().optional(),
  characters: z.array(arcCharacterRoleSchema),
  themeIds: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Input schemas
const createStoryArcInputSchema = z.object({
  seriesId: z.string(),
  name: z.string().min(1),
  description: z.string().default(''),
  status: storyArcStatusSchema.default('planned'),
  startScriptId: z.string().optional(),
  endScriptId: z.string().optional(),
  keyBeats: z.array(arcBeatSchema).default([]),
  resolution: z.string().optional(),
  characters: z.array(arcCharacterRoleSchema).default([]),
  themeIds: z.array(z.string()).default([]),
});

const updateStoryArcInputSchema = z.object({
  storyArcId: z.string(),
  patch: z
    .object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      status: storyArcStatusSchema.optional(),
      startScriptId: z.string().optional(),
      endScriptId: z.string().optional(),
      keyBeats: z.array(arcBeatSchema).optional(),
      resolution: z.string().optional(),
      characters: z.array(arcCharacterRoleSchema).optional(),
      themeIds: z.array(z.string()).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided'),
});

const listStoryArcsInputSchema = z.object({
  seriesId: z.string(),
  status: storyArcStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Procedures
const createStoryArc = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a new story arc',
    description:
      'Creates a story arc entity with narrative metadata (name, description, status, beats, characters, themes). Returns the created story arc.',
  })
  .input(createStoryArcInputSchema)
  .output(storyArcSchema);

const updateStoryArc = authProcedure
  .route({
    path: '/update',
    method: 'PUT',
    summary: 'Update story arc',
    description:
      'Updates story arc fields including status, beats, characters, and themes. Returns the updated story arc.',
  })
  .input(updateStoryArcInputSchema)
  .output(storyArcSchema);

const deleteStoryArc = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete a story arc',
    description:
      'Deletes a story arc if permitted. Story arcs can be safely deleted as they do not have hard dependencies.',
  })
  .input(z.object({ storyArcId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const listStoryArcs = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List story arcs',
    description:
      'Returns paginated story arcs for a series. Can be filtered by status (planned, in_progress, completed, abandoned).',
  })
  .input(listStoryArcsInputSchema)
  .output(z.object({ items: z.array(storyArcSchema), total: z.number() }));

const getStoryArc = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get a story arc',
    description: 'Returns a single story arc by ID. Uses NOT_FOUND for inaccessible resources.',
  })
  .input(z.object({ storyArcId: z.string() }))
  .output(storyArcSchema);

const storyArcContract = oc.prefix('/story-arc').router({
  createStoryArc,
  updateStoryArc,
  deleteStoryArc,
  listStoryArcs,
  getStoryArc,
});

export default storyArcContract;

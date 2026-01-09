import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const sceneBeatSchema = z.object({
  order: z.number().int().min(0),
  description: z.string(),
});

export const sceneSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  scriptId: z.string(),
  sceneNumber: z.number().int().min(1),
  heading: z.string(),
  locationId: z.string().optional(),
  timeOfDay: z.string().optional(),
  duration: z.string().optional(),
  emotionalTone: z.string().optional(),
  conflict: z.string().optional(),
  beats: z.array(sceneBeatSchema).default([]),
  characterIds: z.array(z.string()).default([]),
  propIds: z.array(z.string()).default([]),
  lighting: z.string().optional(),
  sound: z.string().optional(),
  camera: z.string().optional(),
  storyNotes: z.string().optional(),
  storyboardUrl: z.string().url().optional(),
  lastEditedAt: z.coerce.date(),
});

const sceneSummarySchema = sceneSchema.pick({
  _id: true,
  seriesId: true,
  scriptId: true,
  sceneNumber: true,
  heading: true,
  locationId: true,
  timeOfDay: true,
  emotionalTone: true,
  characterIds: true,
  lastEditedAt: true,
});

const createScene = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a scene',
    description: 'Creates a new scene under a script with auto-generated scene number. Returns the created scene.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      scriptId: z.string(),
      heading: z.string().min(1),
      locationId: z.string().optional(),
      timeOfDay: z.string().optional(),
      duration: z.string().optional(),
      emotionalTone: z.string().optional(),
      conflict: z.string().optional(),
      beats: z.array(sceneBeatSchema).optional(),
      characterIds: z.array(z.string()).optional(),
      propIds: z.array(z.string()).optional(),
      lighting: z.string().optional(),
      sound: z.string().optional(),
      camera: z.string().optional(),
      storyNotes: z.string().optional(),
      storyboardUrl: z.string().url().optional(),
    }),
  )
  .output(sceneSchema);

const updateScene = authProcedure
  .route({
    path: '/update',
    method: 'PUT',
    summary: 'Update scene',
    description: 'Updates scene fields. Scene number cannot be changed directly. Returns the updated scene.',
  })
  .input(
    z.object({
      sceneId: z.string(),
      patch: z
        .object({
          heading: z.string().min(1).optional(),
          locationId: z.string().optional(),
          timeOfDay: z.string().optional(),
          duration: z.string().optional(),
          emotionalTone: z.string().optional(),
          conflict: z.string().optional(),
          beats: z.array(sceneBeatSchema).optional(),
          characterIds: z.array(z.string()).optional(),
          propIds: z.array(z.string()).optional(),
          lighting: z.string().optional(),
          sound: z.string().optional(),
          camera: z.string().optional(),
          storyNotes: z.string().optional(),
          storyboardUrl: z.string().url().optional(),
        })
        .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided'),
    }),
  )
  .output(sceneSchema);

const deleteScene = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete a scene',
    description: 'Deletes a scene if permitted. Scene numbers are not automatically reordered after deletion.',
  })
  .input(z.object({ sceneId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const listScenesByScript = authProcedure
  .route({
    path: '/list-by-script',
    method: 'GET',
    summary: 'List scenes by script',
    description: 'Returns paginated scenes for a script, ordered by scene number.',
  })
  .input(paginationSchema.merge(z.object({ scriptId: z.string() })))
  .output(z.object({ items: z.array(sceneSummarySchema), total: z.number() }));

const getScene = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get a scene',
    description: 'Returns a scene with all details. Uses NOT_FOUND for inaccessible resources.',
  })
  .input(z.object({ sceneId: z.string() }))
  .output(sceneSchema);

const sceneContract = oc.prefix('/scene').router({
  createScene,
  updateScene,
  deleteScene,
  listScenesByScript,
  getScene,
});

export default sceneContract;
export { sceneBeatSchema, sceneSummarySchema };

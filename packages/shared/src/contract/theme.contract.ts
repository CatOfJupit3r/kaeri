import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const themeCharacterConnectionSchema = z.object({
  characterId: z.string(),
  connection: z.string(),
});

export const themeEvolutionSchema = z.object({
  scriptId: z.string(),
  notes: z.string(),
});

export const themeAppearanceSchema = z.object({
  sceneId: z.string(),
  quote: z.string().optional(),
  notes: z.string().optional(),
});

export const themeSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional(),
  visualMotifs: z.array(z.string()).optional(),
  relatedCharacters: z.array(themeCharacterConnectionSchema).optional(),
  evolution: z.array(themeEvolutionSchema).optional(),
  appearances: z.array(themeAppearanceSchema).optional(),
});

export const createThemeValueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional(),
  visualMotifs: z.array(z.string()).optional(),
  relatedCharacters: z.array(themeCharacterConnectionSchema).optional(),
  evolution: z.array(themeEvolutionSchema).optional(),
  appearances: z.array(themeAppearanceSchema).optional(),
});

export const updateThemePatchSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
      .optional(),
    visualMotifs: z.array(z.string()).optional(),
    relatedCharacters: z.array(themeCharacterConnectionSchema).optional(),
    evolution: z.array(themeEvolutionSchema).optional(),
    appearances: z.array(themeAppearanceSchema).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

const createTheme = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a new theme',
    description:
      'Creates a theme within a series with name, description, color, visual motifs, character connections, evolution notes, and appearances. Returns the created theme.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      value: createThemeValueSchema,
    }),
  )
  .output(themeSchema);

const updateTheme = authProcedure
  .route({
    path: '/update',
    method: 'PUT',
    summary: 'Update a theme',
    description:
      'Updates theme properties including name, description, color, visual motifs, character connections, evolution notes, and appearances. Returns the updated theme.',
  })
  .input(
    z.object({
      themeId: z.string(),
      patch: updateThemePatchSchema,
    }),
  )
  .output(themeSchema);

const deleteTheme = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete a theme',
    description:
      'Deletes a theme if the user has access to the containing series. Uses NOT_FOUND for inaccessible themes.',
  })
  .input(z.object({ themeId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const listThemesBySeries = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List themes in a series',
    description: 'Returns paginated themes for a given series. Uses NOT_FOUND if series is inaccessible.',
  })
  .input(z.object({ seriesId: z.string() }).merge(paginationSchema))
  .output(z.object({ items: z.array(themeSchema), total: z.number() }));

const getTheme = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get a theme',
    description: 'Returns a single theme by ID. Uses NOT_FOUND for inaccessible themes.',
  })
  .input(z.object({ themeId: z.string() }))
  .output(themeSchema);

const themeContract = oc.prefix('/theme').router({
  createTheme,
  updateTheme,
  deleteTheme,
  listThemesBySeries,
  getTheme,
});

export default themeContract;

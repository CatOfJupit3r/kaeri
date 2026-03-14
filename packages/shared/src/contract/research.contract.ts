import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const researchEntityLinkSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(['character', 'location', 'prop', 'scene', 'theme', 'storyArc']),
  note: z.string().optional(),
});

export const researchSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  entityLinks: z.array(researchEntityLinkSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const createResearchValueSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(''),
  tags: z.array(z.string()).optional(),
  entityLinks: z.array(researchEntityLinkSchema).optional(),
});

export const updateResearchPatchSchema = z
  .object({
    title: z.string().min(1).optional(),
    content: z.string().optional(),
    tags: z.array(z.string()).optional(),
    entityLinks: z.array(researchEntityLinkSchema).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

const createResearch = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a new research entry',
    description:
      'Creates a research entry within a series with title, markdown content, tags, and entity links. Returns the created research entry.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      value: createResearchValueSchema,
    }),
  )
  .output(researchSchema);

const updateResearch = authProcedure
  .route({
    path: '/update',
    method: 'PATCH',
    summary: 'Update a research entry',
    description: 'Updates a research entry by ID with optional new values. Returns the updated research entry.',
  })
  .input(
    z.object({
      researchId: z.string(),
      patch: updateResearchPatchSchema,
    }),
  )
  .output(researchSchema);

const deleteResearch = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete a research entry',
    description: 'Permanently deletes a research entry by ID.',
  })
  .input(z.object({ researchId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const getResearch = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get a research entry by ID',
    description: 'Retrieves a single research entry by its ID.',
  })
  .input(z.object({ researchId: z.string() }))
  .output(researchSchema);

const listResearch = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List research entries for a series',
    description: 'Lists all research entries for a series with optional pagination.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      pagination: paginationSchema.optional(),
    }),
  )
  .output(
    z.object({
      items: z.array(researchSchema),
      total: z.number(),
      hasMore: z.boolean(),
    }),
  );

const searchResearch = authProcedure
  .route({
    path: '/search',
    method: 'GET',
    summary: 'Search research entries',
    description: 'Search research entries by title or content text.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      query: z.string().min(1),
      pagination: paginationSchema.optional(),
    }),
  )
  .output(
    z.object({
      items: z.array(researchSchema),
      total: z.number(),
      hasMore: z.boolean(),
    }),
  );

export const researchContract = oc.router({
  create: createResearch,
  update: updateResearch,
  delete: deleteResearch,
  get: getResearch,
  list: listResearch,
  search: searchResearch,
});

export type ResearchSchema = z.infer<typeof researchSchema>;
export type CreateResearchValue = z.infer<typeof createResearchValueSchema>;
export type UpdateResearchPatch = z.infer<typeof updateResearchPatchSchema>;
export type ResearchEntityLink = z.infer<typeof researchEntityLinkSchema>;

export default researchContract;

import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const scriptSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  title: z.string(),
  authors: z.array(z.string()).optional(),
  genre: z.string().optional(),
  logline: z.string().optional(),
  coverUrl: z.string().url().optional(),
  content: z.string(),
  contentVersion: z.number().int().default(1),
  lastEditedAt: z.coerce.date(),
});

const scriptSummarySchema = scriptSchema.pick({
  _id: true,
  seriesId: true,
  title: true,
  authors: true,
  genre: true,
  logline: true,
  coverUrl: true,
  lastEditedAt: true,
});

export const createScriptInputSchema = z.object({
  seriesId: z.string(),
  title: z.string().min(1),
  authors: z.array(z.string()).optional(),
  genre: z.string().optional(),
  logline: z.string().optional(),
  coverUrl: z.string().url().optional(),
});

export const updateScriptPatchSchema = z
  .object({
    title: z.string().min(1).optional(),
    authors: z.array(z.string()).optional(),
    genre: z.string().optional(),
    logline: z.string().optional(),
    coverUrl: z.string().url().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

const createScript = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a script',
    description: 'Creates a script under a series with metadata and empty content.',
  })
  .input(createScriptInputSchema)
  .output(scriptSchema);

const updateScript = authProcedure
  .route({
    path: '/update',
    method: 'PUT',
    summary: 'Update script metadata',
    description: 'Updates script metadata fields (title, authors, genre, logline, cover).',
  })
  .input(
    z.object({
      scriptId: z.string(),
      patch: updateScriptPatchSchema,
    }),
  )
  .output(scriptSchema);

const deleteScript = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete a script',
    description:
      'Deletes a script if permitted. Implementations should ensure references (appearances) are handled safely.',
  })
  .input(z.object({ scriptId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const listScriptsBySeries = authProcedure
  .route({
    path: '/list-by-series',
    method: 'GET',
    summary: 'List scripts by series',
    description: 'Returns paginated scripts for a series.',
  })
  .input(paginationSchema.merge(z.object({ seriesId: z.string() })))
  .output(z.object({ items: z.array(scriptSummarySchema), total: z.number() }));

const getScript = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get a script',
    description: 'Returns a script with metadata and content.',
  })
  .input(z.object({ scriptId: z.string() }))
  .output(scriptSchema);

const saveScriptContent = authProcedure
  .route({
    path: '/save-content',
    method: 'PUT',
    summary: 'Save script content (autosave/manual)',
    description: 'Saves plaintext script content and returns updated lastEditedAt.',
  })
  .input(
    z.object({
      scriptId: z.string(),
      content: z.string(),
      cursor: z.object({ line: z.number().int().min(0), column: z.number().int().min(0) }).optional(),
    }),
  )
  .output(z.object({ lastEditedAt: z.coerce.date() }));

const exportScriptPdf = authProcedure
  .route({
    path: '/export-pdf',
    method: 'GET',
    summary: 'Export script as PDF',
    description: 'Exports a screenplay-formatted PDF for a script. Should validate saved state before export.',
  })
  .input(z.object({ scriptId: z.string() }))
  .output(z.object({ ok: z.literal(true), fileType: z.literal('application/pdf') }));

const scriptsContract = oc.prefix('/scripts').router({
  createScript,
  updateScript,
  deleteScript,
  listScriptsBySeries,
  getScript,
  saveScriptContent,
  exportScriptPdf,
});

export default scriptsContract;
export { scriptSchema, scriptSummarySchema };

import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const seriesSchema = z.object({
  _id: z.string(),
  title: z.string(),
  genre: z.string().optional(),
  logline: z.string().optional(),
  coverUrl: z.string().url().optional(),
  lastEditedAt: z.coerce.date(),
});

const seriesSummarySchema = seriesSchema.pick({
  _id: true,
  title: true,
  genre: true,
  logline: true,
  coverUrl: true,
  lastEditedAt: true,
});

const createSeries = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a new series',
    description: 'Creates a series container with metadata (title, genre, logline, cover). Returns the created series.',
  })
  .input(
    z.object({
      title: z.string().min(1),
      genre: z.string().optional(),
      logline: z.string().optional(),
      coverUrl: z.string().url().optional(),
    }),
  )
  .output(seriesSchema);

const updateSeries = authProcedure
  .route({
    path: '/update',
    method: 'PUT',
    summary: 'Update series metadata',
    description: 'Updates series title, genre, logline, or cover. Returns the updated series.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      patch: z
        .object({
          title: z.string().min(1).optional(),
          genre: z.string().optional(),
          logline: z.string().optional(),
          coverUrl: z.string().url().optional(),
        })
        .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided'),
    }),
  )
  .output(seriesSchema);

const deleteSeries = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete a series',
    description:
      'Deletes a series if permitted. Implementations should prevent deleting when dependent resources exist or provide a safe migration.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const listSeries = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List series',
    description: 'Returns paginated series for the authenticated user, including lastEditedAt for ordering.',
  })
  .input(paginationSchema)
  .output(z.object({ items: z.array(seriesSummarySchema), total: z.number() }));

const getSeries = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get a series',
    description: 'Returns a single series by ID. Uses NOT_FOUND for inaccessible resources.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(seriesSchema);

const exportSeriesSummary = authProcedure
  .route({
    path: '/export-summary',
    method: 'GET',
    summary: 'Export series summary as JSON',
    description: 'Exports series metadata and script summaries for backup or inspection.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(
    z.object({
      series: seriesSchema,
      scripts: z.array(
        z.object({
          _id: z.string(),
          title: z.string(),
          authors: z.array(z.string()).optional(),
          genre: z.string().optional(),
          logline: z.string().optional(),
          coverUrl: z.string().url().optional(),
          lastEditedAt: z.coerce.date(),
        }),
      ),
    }),
  );

const seriesContract = oc.prefix('/series').router({
  createSeries,
  updateSeries,
  deleteSeries,
  listSeries,
  getSeries,
  exportSeriesSummary,
});

export default seriesContract;

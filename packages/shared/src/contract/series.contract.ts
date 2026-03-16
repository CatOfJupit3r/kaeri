import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Series type enum for different project types
export const seriesTypeSchema = z.enum(['tv-series', 'film-trilogy', 'anthology', 'standalone']);
export const SERIES_TYPES = seriesTypeSchema.enum;
export type SeriesType = z.infer<typeof seriesTypeSchema>;

// Type metadata for UI display
export const SERIES_TYPE_META = {
  [SERIES_TYPES['tv-series']]: {
    label: 'TV Series',
    description: 'Multi-episode television show with seasons',
    icon: 'Tv',
  },
  [SERIES_TYPES['film-trilogy']]: {
    label: 'Film Trilogy',
    description: 'Connected series of feature films',
    icon: 'Film',
  },
  [SERIES_TYPES.anthology]: {
    label: 'Anthology',
    description: 'Collection of standalone stories',
    icon: 'Library',
  },
  [SERIES_TYPES.standalone]: {
    label: 'Standalone',
    description: 'Single feature film or special',
    icon: 'FileText',
  },
} as const;

export const seriesSchema = z.object({
  _id: z.string(),
  title: z.string(),
  type: seriesTypeSchema.default('standalone'),
  genre: z.string().optional(),
  logline: z.string().optional(),
  coverUrl: z.string().url().optional(),
  lastEditedAt: z.coerce.date(),
});

const seriesSummarySchema = seriesSchema.pick({
  _id: true,
  title: true,
  type: true,
  genre: true,
  logline: true,
  coverUrl: true,
  lastEditedAt: true,
});

export const createSeriesInputSchema = z.object({
  title: z.string().min(1),
  type: seriesTypeSchema.default('standalone'),
  genre: z.string().optional(),
  logline: z.string().optional(),
  coverUrl: z.string().url().optional(),
});

export const updateSeriesPatchSchema = z
  .object({
    title: z.string().min(1).optional(),
    type: seriesTypeSchema.optional(),
    genre: z.string().optional(),
    logline: z.string().optional(),
    coverUrl: z.string().url().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

const createSeries = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a new series',
    description: 'Creates a series container with metadata (title, genre, logline, cover). Returns the created series.',
  })
  .input(createSeriesInputSchema)
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
      patch: updateSeriesPatchSchema,
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

// Analytics schemas
const overviewStatsSchema = z.object({
  scriptCount: z.number(),
  characterCount: z.number(),
  locationCount: z.number(),
  propCount: z.number(),
  sceneCount: z.number(),
  totalWordCount: z.number(),
});

const locationDistributionSchema = z.array(
  z.object({
    locationId: z.string(),
    locationName: z.string(),
    sceneCount: z.number(),
  }),
);

const characterAppearancesSchema = z.array(
  z.object({
    characterId: z.string(),
    characterName: z.string(),
    appearanceCount: z.number(),
  }),
);

const storyArcProgressSchema = z.array(
  z.object({
    arcId: z.string(),
    arcName: z.string(),
    status: z.string(),
    beatCount: z.number(),
  }),
);

const writingActivitySchema = z.array(
  z.object({
    date: z.string(),
    wordCount: z.number(),
    scriptId: z.string().optional(),
  }),
);

const analyticsSchema = z.object({
  overview: overviewStatsSchema,
  locationDistribution: locationDistributionSchema,
  characterAppearances: characterAppearancesSchema,
  storyArcProgress: storyArcProgressSchema,
  writingActivity: writingActivitySchema,
});

const getSeriesAnalytics = authProcedure
  .route({
    path: '/analytics',
    method: 'GET',
    summary: 'Get series analytics',
    description:
      'Returns aggregated statistics and charts data for a series including entity counts, distributions, and activity.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(analyticsSchema);

const transferSeries = authProcedure
  .route({
    path: '/transfer',
    method: 'POST',
    summary: 'Transfer series to another workspace',
    description:
      'Transfers a series from its current workspace to a target workspace. User must have ADMIN or higher role in both source and destination workspaces. All content (scripts, KB entities, canvas) is preserved.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      targetWorkspaceId: z.string(),
    }),
  )
  .output(z.object({ success: z.boolean() }));

const seriesContract = oc.prefix('/series').router({
  createSeries,
  updateSeries,
  deleteSeries,
  listSeries,
  getSeries,
  exportSeriesSummary,
  getSeriesAnalytics,
  transferSeries,
});

export type SeriesAnalytics = z.infer<typeof analyticsSchema>;
export type OverviewStats = z.infer<typeof overviewStatsSchema>;

export default seriesContract;

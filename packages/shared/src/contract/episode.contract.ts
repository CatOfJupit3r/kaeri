import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Episode status enum
export const episodeStatusSchema = z.enum(['outline', 'in_progress', 'complete']);
export const EPISODE_STATUS = episodeStatusSchema.enum;
export type EpisodeStatus = z.infer<typeof episodeStatusSchema>;

// Episode status metadata for UI display
export const EPISODE_STATUS_META = {
  [EPISODE_STATUS.outline]: {
    label: 'Outline',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  [EPISODE_STATUS.in_progress]: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  [EPISODE_STATUS.complete]: {
    label: 'Complete',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
} as const;

// Episode entity schema
export const episodeSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  seasonNumber: z.number().int().min(1).default(1),
  episodeNumber: z.number().int().min(1),
  title: z.string(),
  description: z.string().optional(),
  scriptIds: z.array(z.string()).default([]),
  status: episodeStatusSchema.default('outline'),
  airDate: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Episode = z.infer<typeof episodeSchema>;

// Create episode input
export const createEpisodeInputSchema = z.object({
  seriesId: z.string(),
  seasonNumber: z.number().int().min(1).default(1),
  episodeNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  scriptIds: z.array(z.string()).default([]),
  status: episodeStatusSchema.default('outline'),
  airDate: z.coerce.date().optional(),
});

// Update episode input
export const updateEpisodePatchSchema = z
  .object({
    seasonNumber: z.number().int().min(1).optional(),
    episodeNumber: z.number().int().min(1).optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    scriptIds: z.array(z.string()).optional(),
    status: episodeStatusSchema.optional(),
    airDate: z.coerce.date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

// Contract procedures
const createEpisode = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a new episode',
    description: 'Creates an episode within a TV series. Episodes are numbered per season.',
  })
  .input(createEpisodeInputSchema)
  .output(episodeSchema);

const updateEpisode = authProcedure
  .route({
    path: '/update',
    method: 'PUT',
    summary: 'Update episode details',
    description: 'Updates episode title, description, status, or other metadata.',
  })
  .input(
    z.object({
      episodeId: z.string(),
      patch: updateEpisodePatchSchema,
    }),
  )
  .output(episodeSchema);

const deleteEpisode = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete an episode',
    description: 'Deletes an episode. Associated scripts remain but are unlinked.',
  })
  .input(z.object({ episodeId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const listEpisodesBySeries = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List episodes by series',
    description: 'Returns paginated episodes for a series, ordered by season and episode number.',
  })
  .input(
    z
      .object({
        seriesId: z.string(),
        seasonNumber: z.number().int().min(1).optional(),
      })
      .merge(paginationSchema),
  )
  .output(z.object({ items: z.array(episodeSchema), total: z.number() }));

const getEpisode = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get an episode',
    description: 'Returns a single episode by ID.',
  })
  .input(z.object({ episodeId: z.string() }))
  .output(episodeSchema);

const linkScript = authProcedure
  .route({
    path: '/link-script',
    method: 'POST',
    summary: 'Link a script to an episode',
    description: 'Associates a script with an episode for production tracking.',
  })
  .input(z.object({ episodeId: z.string(), scriptId: z.string() }))
  .output(episodeSchema);

const unlinkScript = authProcedure
  .route({
    path: '/unlink-script',
    method: 'POST',
    summary: 'Unlink a script from an episode',
    description: 'Removes the association between a script and an episode.',
  })
  .input(z.object({ episodeId: z.string(), scriptId: z.string() }))
  .output(episodeSchema);

const episodeContract = oc.prefix('/episode').router({
  createEpisode,
  updateEpisode,
  deleteEpisode,
  listEpisodesBySeries,
  getEpisode,
  linkScript,
  unlinkScript,
});

export default episodeContract;

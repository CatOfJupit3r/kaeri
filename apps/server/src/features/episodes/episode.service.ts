import { inject, injectable } from 'tsyringe';
import type z from 'zod';

import { errorCodes } from '@kaeri/shared';
import type { createEpisodeInputSchema, updateEpisodePatchSchema } from '@kaeri/shared/contract/episode.contract';

import { EpisodeModel } from '@~/db/models/episode.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TOKENS } from '@~/di/tokens';
import { ORPCBadRequestError, ORPCNotFoundError, ORPCUnprocessableContentError } from '@~/lib/orpc-error-wrapper';

import type { iWithLogger, LoggerFactory } from '../logger/logger.types';

type CreateEpisodeInput = z.infer<typeof createEpisodeInputSchema>;
type UpdateEpisodePatch = z.infer<typeof updateEpisodePatchSchema>;

@injectable()
export class EpisodeService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('episode-service');
  }

  public async create(data: CreateEpisodeInput) {
    // Validate series exists and is a TV series
    const series = await SeriesModel.findById(data.seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (series.type !== 'tv-series') {
      throw ORPCBadRequestError(errorCodes.EPISODE_SERIES_MUST_BE_TV_SERIES);
    }

    // Check for duplicate episode number in the same season
    const existing = await EpisodeModel.findOne({
      seriesId: data.seriesId,
      seasonNumber: data.seasonNumber,
      episodeNumber: data.episodeNumber,
    });

    if (existing) {
      throw ORPCUnprocessableContentError(errorCodes.EPISODE_DUPLICATE_NUMBER, {
        seasonNumber: data.seasonNumber,
        episodeNumber: data.episodeNumber,
      });
    }

    const episode = await EpisodeModel.create({
      seriesId: data.seriesId,
      seasonNumber: data.seasonNumber ?? 1,
      episodeNumber: data.episodeNumber,
      title: data.title,
      description: data.description,
      scriptIds: data.scriptIds ?? [],
      status: data.status ?? 'outline',
      airDate: data.airDate,
    });

    this.logger.info('Episode created', {
      episodeId: episode._id,
      seriesId: data.seriesId,
      episode: `S${episode.seasonNumber}E${episode.episodeNumber}`,
    });

    return episode;
  }

  public async update(episodeId: string, patch: UpdateEpisodePatch) {
    const episode = await EpisodeModel.findById(episodeId);
    if (!episode) {
      throw ORPCNotFoundError(errorCodes.EPISODE_NOT_FOUND);
    }

    // If changing episode/season number, check for conflicts
    if (patch.episodeNumber !== undefined || patch.seasonNumber !== undefined) {
      const newSeasonNumber = patch.seasonNumber ?? episode.seasonNumber;
      const newEpisodeNumber = patch.episodeNumber ?? episode.episodeNumber;

      const existing = await EpisodeModel.findOne({
        seriesId: episode.seriesId,
        seasonNumber: newSeasonNumber,
        episodeNumber: newEpisodeNumber,
        _id: { $ne: episodeId },
      });

      if (existing) {
        throw ORPCUnprocessableContentError(errorCodes.EPISODE_DUPLICATE_NUMBER, {
          seasonNumber: newSeasonNumber,
          episodeNumber: newEpisodeNumber,
        });
      }
    }

    if (patch.seasonNumber !== undefined) episode.seasonNumber = patch.seasonNumber;
    if (patch.episodeNumber !== undefined) episode.episodeNumber = patch.episodeNumber;
    if (patch.title !== undefined) episode.title = patch.title;
    if (patch.description !== undefined) episode.description = patch.description;
    if (patch.scriptIds !== undefined) episode.scriptIds = patch.scriptIds;
    if (patch.status !== undefined) episode.status = patch.status;
    if (patch.airDate !== undefined) episode.airDate = patch.airDate;

    await episode.save();

    this.logger.info('Episode updated', { episodeId });

    return episode;
  }

  public async delete(episodeId: string) {
    const episode = await EpisodeModel.findById(episodeId);
    if (!episode) {
      throw ORPCNotFoundError(errorCodes.EPISODE_NOT_FOUND);
    }

    await EpisodeModel.deleteOne({ _id: episodeId });

    this.logger.info('Episode deleted', { episodeId });

    return { success: true };
  }

  public async list(seriesId: string, seasonNumber?: number, limit = 20, offset = 0) {
    const query: Record<string, unknown> = { seriesId };
    if (seasonNumber !== undefined) {
      query.seasonNumber = seasonNumber;
    }

    const [items, total] = await Promise.all([
      EpisodeModel.find(query).sort({ seasonNumber: 1, episodeNumber: 1 }).limit(limit).skip(offset).lean(),
      EpisodeModel.countDocuments(query),
    ]);

    return { items, total };
  }

  public async get(episodeId: string) {
    const episode = await EpisodeModel.findById(episodeId);
    if (!episode) {
      throw ORPCNotFoundError(errorCodes.EPISODE_NOT_FOUND);
    }

    return episode;
  }

  public async linkScript(episodeId: string, scriptId: string) {
    const episode = await EpisodeModel.findById(episodeId);
    if (!episode) {
      throw ORPCNotFoundError(errorCodes.EPISODE_NOT_FOUND);
    }

    if (!episode.scriptIds.includes(scriptId)) {
      episode.scriptIds.push(scriptId);
      await episode.save();
      this.logger.info('Script linked to episode', { episodeId, scriptId });
    }

    return episode;
  }

  public async unlinkScript(episodeId: string, scriptId: string) {
    const episode = await EpisodeModel.findById(episodeId);
    if (!episode) {
      throw ORPCNotFoundError(errorCodes.EPISODE_NOT_FOUND);
    }

    episode.scriptIds = episode.scriptIds.filter((id) => id !== scriptId);
    await episode.save();
    this.logger.info('Script unlinked from episode', { episodeId, scriptId });

    return episode;
  }
}

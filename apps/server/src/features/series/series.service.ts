import { inject, injectable } from 'tsyringe';

import { errorCodes } from '@kaeri/shared';

import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TOKENS } from '@~/di/tokens';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import { ORPCBadRequestError, ORPCNotFoundError, ORPCUnprocessableContentError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';
import type { ValkeyService } from '../valkey/valkey.service';
import { SERIES_EVENTS } from './series.events';

@injectable()
export class SeriesService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('series-service');
  }

  public async create(data: { title: string; genre?: string; logline?: string; coverUrl?: string }) {
    if (!data.title?.trim()) {
      throw ORPCBadRequestError(errorCodes.SERIES_TITLE_REQUIRED);
    }

    const series = await SeriesModel.create({
      title: data.title,
      genre: data.genre,
      logline: data.logline,
      coverUrl: data.coverUrl,
      lastEditedAt: new Date(),
    });

    this.logger.info('Series created', { seriesId: series._id, title: series.title });

    // Emit event for cache invalidation
    this.eventBus.emit(SERIES_EVENTS.CREATED, { seriesId: series._id });

    return series;
  }

  public async update(
    seriesId: string,
    patch: { title?: string; genre?: string; logline?: string; coverUrl?: string },
  ) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (patch.title !== undefined) series.title = patch.title;
    if (patch.genre !== undefined) series.genre = patch.genre;
    if (patch.logline !== undefined) series.logline = patch.logline;
    if (patch.coverUrl !== undefined) series.coverUrl = patch.coverUrl;

    series.lastEditedAt = new Date();
    await series.save();

    // Emit event for cache invalidation
    this.eventBus.emit(SERIES_EVENTS.UPDATED, { seriesId: series._id });
    this.logger.info('Series updated', { seriesId: series._id });

    return series;
  }

  public async delete(seriesId: string) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    // Check for dependent scripts
    const scriptCount = await ScriptModel.countDocuments({ seriesId });
    if (scriptCount > 0) {
      throw ORPCUnprocessableContentError(errorCodes.SERIES_DELETE_HAS_DEPENDENCIES);
    }

    // TODO: Check for KB entities, canvas nodes/edges, etc.

    await SeriesModel.deleteOne({ _id: seriesId });

    // Emit event for cache invalidation
    this.eventBus.emit(SERIES_EVENTS.DELETED, { seriesId });
    this.logger.info('Series deleted', { seriesId });

    return { success: true };
  }

  public async list(limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      SeriesModel.find().sort({ lastEditedAt: -1 }).limit(limit).skip(offset).lean(),
      SeriesModel.countDocuments(),
    ]);

    return { items, total };
  }

  public async get(seriesId: string) {
    return this.valkey.cached(buildCacheKey.series(seriesId), CACHE_TTL.ENTITY_MEDIUM, async () => {
      this.logger.debug('Fetching series from database', { seriesId });
      const series = await SeriesModel.findById(seriesId);
      if (!series) throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);

      return series;
    });
  }

  public async exportSummary(seriesId: string) {
    const series = await this.get(seriesId);
    const scripts = await ScriptModel.find({ seriesId })
      .select('_id title authors genre logline coverUrl lastEditedAt')
      .sort({ lastEditedAt: -1 })
      .lean();

    return { series, scripts };
  }
}

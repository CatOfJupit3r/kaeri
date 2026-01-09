import { inject, injectable } from 'tsyringe';

import { errorCodes } from '@kaeri/shared';

import { SeriesModel } from '@~/db/models/series.model';
import { ThemeModel } from '@~/db/models/theme.model';
import { TOKENS } from '@~/di/tokens';
import { ORPCBadRequestError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';

interface iCreateThemeInput {
  name: string;
  description?: string;
  color?: string;
  visualMotifs?: string[];
  relatedCharacters?: Array<{ characterId: string; connection: string }>;
  evolution?: Array<{ scriptId: string; notes: string }>;
  appearances?: Array<{ scriptId: string; sceneRef: string; quote?: string }>;
}

interface iUpdateThemeInput {
  name?: string;
  description?: string;
  color?: string;
  visualMotifs?: string[];
  relatedCharacters?: Array<{ characterId: string; connection: string }>;
  evolution?: Array<{ scriptId: string; notes: string }>;
  appearances?: Array<{ scriptId: string; sceneRef: string; quote?: string }>;
}

@injectable()
export class ThemeService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('theme-service');
  }

  public async create(seriesId: string, data: iCreateThemeInput) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.name?.trim()) {
      throw ORPCBadRequestError(errorCodes.THEME_NAME_REQUIRED);
    }

    const theme = await ThemeModel.create({
      seriesId,
      name: data.name,
      description: data.description,
      color: data.color,
      visualMotifs: data.visualMotifs,
      relatedCharacters: data.relatedCharacters,
      evolution: data.evolution,
      appearances: data.appearances,
    });

    this.logger.info('Theme created', { themeId: theme._id, seriesId, name: theme.name });

    return theme;
  }

  public async update(themeId: string, patch: iUpdateThemeInput) {
    const theme = await ThemeModel.findById(themeId);
    if (!theme) {
      throw ORPCNotFoundError(errorCodes.THEME_NOT_FOUND);
    }

    if (patch.name !== undefined) {
      if (!patch.name?.trim()) {
        throw ORPCBadRequestError(errorCodes.THEME_NAME_REQUIRED);
      }
      theme.name = patch.name;
    }

    if (patch.description !== undefined) theme.description = patch.description;
    if (patch.color !== undefined) theme.color = patch.color;
    if (patch.visualMotifs !== undefined) theme.visualMotifs = patch.visualMotifs;
    if (patch.relatedCharacters !== undefined) theme.relatedCharacters = patch.relatedCharacters;
    if (patch.evolution !== undefined) theme.evolution = patch.evolution;
    if (patch.appearances !== undefined) theme.appearances = patch.appearances;

    await theme.save();

    this.logger.info('Theme updated', { themeId: theme._id, seriesId: theme.seriesId });

    return theme;
  }

  public async delete(themeId: string) {
    const theme = await ThemeModel.findById(themeId);
    if (!theme) {
      throw ORPCNotFoundError(errorCodes.THEME_NOT_FOUND);
    }

    await ThemeModel.deleteOne({ _id: themeId });

    this.logger.info('Theme deleted', { themeId, seriesId: theme.seriesId });

    return { success: true };
  }

  public async list(seriesId: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      ThemeModel.find({ seriesId }).sort({ name: 1 }).limit(limit).skip(offset).lean(),
      ThemeModel.countDocuments({ seriesId }),
    ]);

    return { items, total };
  }

  public async get(themeId: string) {
    const theme = await ThemeModel.findById(themeId);
    if (!theme) {
      throw ORPCNotFoundError(errorCodes.THEME_NOT_FOUND);
    }

    return theme;
  }
}

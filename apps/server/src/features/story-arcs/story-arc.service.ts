import { inject, injectable } from 'tsyringe';
import type z from 'zod';

import { errorCodes } from '@kaeri/shared';
import { createStoryArcInputSchema, updateStoryArcPatchSchema } from '@kaeri/shared/contract/story-arc.contract';

import { StoryArcModel } from '@~/db/models/story-arc.model';
import { TOKENS } from '@~/di/tokens';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import { ORPCBadRequestError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';
import type { ValkeyService } from '../valkey/valkey.service';
import { STORY_ARC_EVENTS } from './story-arc.events';

type CreateStoryArcInput = z.infer<typeof createStoryArcInputSchema>;
type UpdateStoryArcPatch = z.infer<typeof updateStoryArcPatchSchema>;

@injectable()
export class StoryArcService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('story-arc-service');
  }

  public async create(data: CreateStoryArcInput) {
    if (!data.name?.trim()) {
      throw ORPCBadRequestError(errorCodes.STORY_ARC_NAME_REQUIRED);
    }

    const storyArc = await StoryArcModel.create({
      seriesId: data.seriesId,
      name: data.name,
      description: data.description ?? '',
      status: data.status ?? 'planned',
      startScriptId: data.startScriptId,
      endScriptId: data.endScriptId,
      keyBeats: data.keyBeats ?? [],
      resolution: data.resolution,
      characters: data.characters ?? [],
      themeIds: data.themeIds ?? [],
    });

    this.logger.info('Story arc created', { storyArcId: storyArc._id, name: storyArc.name });

    // Emit event for cache invalidation
    this.eventBus.emit(STORY_ARC_EVENTS.CREATED, { storyArcId: storyArc._id, seriesId: data.seriesId });

    return storyArc;
  }

  public async update(storyArcId: string, patch: UpdateStoryArcPatch) {
    const storyArc = await StoryArcModel.findById(storyArcId);
    if (!storyArc) {
      throw ORPCNotFoundError(errorCodes.STORY_ARC_NOT_FOUND);
    }

    if (patch.name !== undefined) {
      if (!patch.name.trim()) {
        throw ORPCBadRequestError(errorCodes.STORY_ARC_NAME_REQUIRED);
      }
      storyArc.name = patch.name;
    }
    if (patch.description !== undefined) storyArc.description = patch.description;
    if (patch.status !== undefined) storyArc.status = patch.status;
    if (patch.startScriptId !== undefined) storyArc.startScriptId = patch.startScriptId;
    if (patch.endScriptId !== undefined) storyArc.endScriptId = patch.endScriptId;
    if (patch.keyBeats !== undefined) storyArc.keyBeats = patch.keyBeats;
    if (patch.resolution !== undefined) storyArc.resolution = patch.resolution;
    if (patch.characters !== undefined) storyArc.characters = patch.characters;
    if (patch.themeIds !== undefined) storyArc.themeIds = patch.themeIds;

    await storyArc.save();

    // Emit event for cache invalidation
    this.eventBus.emit(STORY_ARC_EVENTS.UPDATED, { storyArcId: storyArc._id, seriesId: storyArc.seriesId });
    this.logger.info('Story arc updated', { storyArcId: storyArc._id });

    return storyArc;
  }

  public async delete(storyArcId: string) {
    const storyArc = await StoryArcModel.findById(storyArcId);
    if (!storyArc) {
      throw ORPCNotFoundError(errorCodes.STORY_ARC_NOT_FOUND);
    }

    const { seriesId } = storyArc;
    await StoryArcModel.deleteOne({ _id: storyArcId });

    // Emit event for cache invalidation
    this.eventBus.emit(STORY_ARC_EVENTS.DELETED, { storyArcId, seriesId });
    this.logger.info('Story arc deleted', { storyArcId });

    return { success: true };
  }

  public async list(seriesId: string, status?: string, limit = 20, offset = 0) {
    const filter: Record<string, unknown> = { seriesId };
    if (status) {
      filter.status = status;
    }

    const [items, total] = await Promise.all([
      StoryArcModel.find(filter).sort({ createdAt: -1 }).limit(limit).skip(offset).lean(),
      StoryArcModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  public async get(storyArcId: string) {
    return this.valkey.cached(buildCacheKey.storyArc(storyArcId), CACHE_TTL.ENTITY_MEDIUM, async () => {
      this.logger.debug('Fetching story arc from database', { storyArcId });
      const storyArc = await StoryArcModel.findById(storyArcId);
      if (!storyArc) throw ORPCNotFoundError(errorCodes.STORY_ARC_NOT_FOUND);

      return storyArc;
    });
  }
}

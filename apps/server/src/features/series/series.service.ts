import { inject, injectable } from 'tsyringe';
import type z from 'zod';

import { errorCodes, WORKSPACE_ROLES } from '@kaeri/shared';
import { createSeriesInputSchema, updateSeriesPatchSchema } from '@kaeri/shared/contract/series.contract';

import { CharacterModel } from '@~/db/models/character.model';
import { LocationModel } from '@~/db/models/location.model';
import { PropModel } from '@~/db/models/prop.model';
import { SceneModel } from '@~/db/models/scene.model';
import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { StoryArcModel } from '@~/db/models/story-arc.model';
import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { TOKENS } from '@~/di/tokens';
import type { PermissionService } from '@~/features/collaboration/permission.service';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import { ORPCBadRequestError, ORPCNotFoundError, ORPCUnprocessableContentError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';
import type { ValkeyService } from '../valkey/valkey.service';
import { SERIES_EVENTS } from './series.events';

type CreateSeriesInput = z.infer<typeof createSeriesInputSchema>;
type UpdateSeriesPatch = z.infer<typeof updateSeriesPatchSchema>;

@injectable()
export class SeriesService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
    @inject(TOKENS.PermissionService) private readonly permissionService: PermissionService,
  ) {
    this.logger = loggerFactory.create('series-service');
  }

  public async create(data: CreateSeriesInput) {
    if (!data.title?.trim()) {
      throw ORPCBadRequestError(errorCodes.SERIES_TITLE_REQUIRED);
    }

    const series = await SeriesModel.create({
      title: data.title,
      type: data.type ?? 'standalone',
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

  public async update(seriesId: string, patch: UpdateSeriesPatch) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (patch.title !== undefined) series.title = patch.title;
    if (patch.type !== undefined) series.type = patch.type;
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

  /**
   * List series accessible to the user.
   * Only returns series from workspaces where the user is a member.
   */
  public async list(userId: string, limit = 20, offset = 0) {
    // Get all workspace IDs where the user is a member
    const memberships = await WorkspaceMemberModel.find({ userId }).select('workspaceId').lean();
    const workspaceIds = memberships.map((m) => m.workspaceId);

    // If user has no workspace memberships, return empty list
    if (workspaceIds.length === 0) {
      return { items: [], total: 0 };
    }

    const [items, total] = await Promise.all([
      SeriesModel.find({ workspaceId: { $in: workspaceIds } })
        .sort({ lastEditedAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      SeriesModel.countDocuments({ workspaceId: { $in: workspaceIds } }),
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

  public async getAnalytics(seriesId: string) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    // Fetch all counts in parallel
    const [
      scriptCount,
      characterCount,
      locationCount,
      propCount,
      sceneCount,
      characters,
      locations,
      storyArcs,
      scripts,
    ] = await Promise.all([
      ScriptModel.countDocuments({ seriesId }),
      CharacterModel.countDocuments({ seriesId }),
      LocationModel.countDocuments({ seriesId }),
      PropModel.countDocuments({ seriesId }),
      SceneModel.countDocuments({ seriesId }),
      CharacterModel.find({ seriesId }).select('_id name appearances').lean(),
      LocationModel.find({ seriesId }).select('_id name').lean(),
      StoryArcModel.find({ seriesId }).select('_id name status keyBeats').lean(),
      ScriptModel.find({ seriesId }).select('_id content updatedAt').lean(),
    ]);

    // Calculate total word count from scripts
    let totalWordCount = 0;
    const writingActivity: Array<{ date: string; wordCount: number; scriptId?: string }> = [];

    for (const script of scripts) {
      const content = script.content ?? '';
      const words = content.split(/\s+/).filter(Boolean).length;
      totalWordCount += words;

      // Track writing activity by date
      if (script.updatedAt) {
        const date = new Date(script.updatedAt).toISOString().split('T')[0];
        writingActivity.push({
          date,
          wordCount: words,
          scriptId: script._id,
        });
      }
    }

    // Get scenes grouped by location
    const scenesWithLocation = await SceneModel.find({ seriesId, locationId: { $exists: true, $ne: null } })
      .select('locationId')
      .lean();

    const locationSceneCount = new Map<string, number>();
    for (const scene of scenesWithLocation) {
      if (scene.locationId) {
        locationSceneCount.set(scene.locationId, (locationSceneCount.get(scene.locationId) ?? 0) + 1);
      }
    }

    const locationDistribution = locations
      .map((loc) => ({
        locationId: loc._id,
        locationName: loc.name,
        sceneCount: locationSceneCount.get(loc._id) ?? 0,
      }))
      .sort((a, b) => b.sceneCount - a.sceneCount);

    // Calculate character appearances
    const characterAppearances = characters
      .map((char) => ({
        characterId: char._id,
        characterName: char.name,
        appearanceCount: char.appearances?.length ?? 0,
      }))
      .sort((a, b) => b.appearanceCount - a.appearanceCount);

    // Story arc progress
    const storyArcProgress = storyArcs.map((arc) => ({
      arcId: arc._id,
      arcName: arc.name,
      status: arc.status,
      beatCount: arc.keyBeats?.length ?? 0,
    }));

    return {
      overview: {
        scriptCount,
        characterCount,
        locationCount,
        propCount,
        sceneCount,
        totalWordCount,
      },
      locationDistribution,
      characterAppearances,
      storyArcProgress,
      writingActivity,
    };
  }

  /**
   * Transfer a series to another workspace.
   *
   * Requirements:
   * - User must have ADMIN or higher in the source workspace
   * - User must have ADMIN or higher in the destination workspace
   * - All content (scripts, KB entities, canvas) is preserved atomically
   *
   * @param seriesId - The series to transfer
   * @param targetWorkspaceId - The destination workspace
   * @param userId - The user performing the transfer
   */
  public async transfer(seriesId: string, targetWorkspaceId: string, userId: string) {
    // Fetch the series first
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const fromWorkspaceId = series.workspaceId;

    // Cannot transfer to the same workspace
    if (fromWorkspaceId === targetWorkspaceId) {
      throw ORPCBadRequestError(errorCodes.SERIES_ALREADY_IN_WORKSPACE);
    }

    // Verify ADMIN permissions in source workspace
    await this.permissionService.requirePermission(fromWorkspaceId, userId, WORKSPACE_ROLES.ADMIN);

    // Verify ADMIN permissions in destination workspace
    await this.permissionService.requirePermission(targetWorkspaceId, userId, WORKSPACE_ROLES.ADMIN);

    // Atomic update - just change the workspaceId
    // All linked content (scripts, KB entities, canvas) remains tied to the series via seriesId
    await SeriesModel.updateOne({ _id: seriesId }, { $set: { workspaceId: targetWorkspaceId } });

    // Emit event for cache invalidation
    this.eventBus.emit(SERIES_EVENTS.TRANSFERRED, {
      seriesId,
      fromWorkspaceId,
      toWorkspaceId: targetWorkspaceId,
      transferredById: userId,
    });

    this.logger.info('Series transferred', {
      seriesId,
      fromWorkspaceId,
      toWorkspaceId: targetWorkspaceId,
      transferredById: userId,
    });

    return { success: true };
  }
}

import { inject, injectable } from 'tsyringe';
import type z from 'zod';

import { errorCodes } from '@kaeri/shared';
import { createSceneInputSchema, updateScenePatchSchema } from '@kaeri/shared/contract/scene.contract';

import { SceneModel } from '@~/db/models/scene.model';
import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TOKENS } from '@~/di/tokens';
import { ORPCBadRequestError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { iWithLogger, LoggerFactory } from '../logger/logger.types';

type CreateSceneInput = z.infer<typeof createSceneInputSchema>;
type UpdateScenePatch = z.infer<typeof updateScenePatchSchema>;

@injectable()
export class SceneService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('scene-service');
  }

  public async create(data: CreateSceneInput) {
    // Verify series exists
    const series = await SeriesModel.findById(data.seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    // Verify script exists
    const script = await ScriptModel.findById(data.scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    // Verify script belongs to series
    if (script.seriesId !== data.seriesId) {
      throw ORPCBadRequestError(errorCodes.SCRIPT_SERIES_MISMATCH);
    }

    if (!data.heading?.trim()) {
      throw ORPCBadRequestError(errorCodes.SCENE_HEADING_REQUIRED);
    }

    // Auto-generate scene number (get max scene number for this script and add 1)
    const maxScene = await SceneModel.findOne({ scriptId: data.scriptId }).sort({ sceneNumber: -1 }).limit(1);
    const sceneNumber = maxScene ? maxScene.sceneNumber + 1 : 1;

    const scene = await SceneModel.create({
      seriesId: data.seriesId,
      scriptId: data.scriptId,
      sceneNumber,
      heading: data.heading,
      locationId: data.locationId,
      timeOfDay: data.timeOfDay,
      duration: data.duration,
      emotionalTone: data.emotionalTone,
      conflict: data.conflict,
      beats: data.beats ?? [],
      characterIds: data.characterIds ?? [],
      propIds: data.propIds ?? [],
      lighting: data.lighting,
      sound: data.sound,
      camera: data.camera,
      storyNotes: data.storyNotes,
      storyboardUrl: data.storyboardUrl,
      lastEditedAt: new Date(),
    });

    // Update script and series lastEditedAt
    script.lastEditedAt = new Date();
    await script.save();
    series.lastEditedAt = new Date();
    await series.save();

    this.logger.info('Scene created', { sceneId: scene._id, scriptId: data.scriptId, sceneNumber });
    return scene;
  }

  public async update(sceneId: string, patch: UpdateScenePatch) {
    const scene = await SceneModel.findById(sceneId);
    if (!scene) {
      throw ORPCNotFoundError(errorCodes.SCENE_NOT_FOUND);
    }

    if (patch.heading !== undefined) scene.heading = patch.heading;
    if (patch.locationId !== undefined) scene.locationId = patch.locationId;
    if (patch.timeOfDay !== undefined) scene.timeOfDay = patch.timeOfDay;
    if (patch.duration !== undefined) scene.duration = patch.duration;
    if (patch.emotionalTone !== undefined) scene.emotionalTone = patch.emotionalTone;
    if (patch.conflict !== undefined) scene.conflict = patch.conflict;
    if (patch.beats !== undefined) scene.beats = patch.beats;
    if (patch.characterIds !== undefined) scene.characterIds = patch.characterIds;
    if (patch.propIds !== undefined) scene.propIds = patch.propIds;
    if (patch.lighting !== undefined) scene.lighting = patch.lighting;
    if (patch.sound !== undefined) scene.sound = patch.sound;
    if (patch.camera !== undefined) scene.camera = patch.camera;
    if (patch.storyNotes !== undefined) scene.storyNotes = patch.storyNotes;
    if (patch.storyboardUrl !== undefined) scene.storyboardUrl = patch.storyboardUrl;

    scene.lastEditedAt = new Date();
    await scene.save();

    // Update script and series lastEditedAt
    await ScriptModel.findByIdAndUpdate(scene.scriptId, { lastEditedAt: new Date() });
    await SeriesModel.findByIdAndUpdate(scene.seriesId, { lastEditedAt: new Date() });

    this.logger.info('Scene updated', { sceneId: scene._id });
    return scene;
  }

  public async delete(sceneId: string) {
    const scene = await SceneModel.findById(sceneId);
    if (!scene) {
      throw ORPCNotFoundError(errorCodes.SCENE_NOT_FOUND);
    }

    await SceneModel.deleteOne({ _id: sceneId });

    // Update script and series lastEditedAt
    await ScriptModel.findByIdAndUpdate(scene.scriptId, { lastEditedAt: new Date() });
    await SeriesModel.findByIdAndUpdate(scene.seriesId, { lastEditedAt: new Date() });

    this.logger.info('Scene deleted', { sceneId });
    return { success: true };
  }

  public async listByScript(scriptId: string, limit = 20, offset = 0) {
    // Verify script exists
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      SceneModel.find({ scriptId })
        .select(
          '_id seriesId scriptId sceneNumber heading locationId timeOfDay emotionalTone characterIds lastEditedAt',
        )
        .sort({ sceneNumber: 1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      SceneModel.countDocuments({ scriptId }),
    ]);

    return { items, total };
  }

  public async get(sceneId: string) {
    const scene = await SceneModel.findById(sceneId);
    if (!scene) {
      throw ORPCNotFoundError(errorCodes.SCENE_NOT_FOUND);
    }
    return scene;
  }
}

import { inject, injectable } from 'tsyringe';

import type {
  AppearanceEntityType,
  AppearanceRecord,
  AutocompleteEntityType,
  AutocompleteSuggestion,
} from '@kaeri/shared/contract/script-kb-integration.contract';
import {
  APPEARANCE_ENTITY_TYPES,
  AUTOCOMPLETE_ENTITY_TYPES,
} from '@kaeri/shared/contract/script-kb-integration.contract';
import { errorCodes } from '@kaeri/shared/enums/errors.enums';

import { CharacterModel } from '@~/db/models/character.model';
import { LocationModel } from '@~/db/models/location.model';
import { PropModel } from '@~/db/models/prop.model';
import { SceneModel } from '@~/db/models/scene.model';
import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { StoryArcModel } from '@~/db/models/story-arc.model';
import { ThemeModel } from '@~/db/models/theme.model';
import { WildCardModel } from '@~/db/models/wildcard.model';
import { TOKENS } from '@~/di/tokens';
import type { LoggerFactory, iWithLogger } from '@~/features/logger/logger.types';
import { ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

interface iAutocompleteSearchInput {
  seriesId: string;
  entityType: AutocompleteEntityType;
  query: string;
  limit: number;
  context?: {
    scriptId?: string;
    blockType?: string;
    recentlyUsed?: string[];
  };
}

interface iSyncAppearancesInput {
  scriptId: string;
  seriesId: string;
  appearances: AppearanceRecord[];
  previousVersion?: number;
}

interface iQuickCreateEntityInput {
  seriesId: string;
  entityType: 'character' | 'location' | 'prop' | 'wildcard';
  name: string;
  description?: string;
  initialAppearance?: {
    scriptId: string;
    sceneRef: string;
  };
}

interface iEnsureSceneInput {
  scriptId: string;
  seriesId: string;
  heading: string;
  sceneNumber: number;
  locationId?: string;
  timeOfDay?: string;
}

interface iPollEntityUpdatesInput {
  seriesId: string;
  sinceVersion: number;
  entityTypes?: AutocompleteEntityType[];
  timeout: number;
}

interface iGetScriptEntityLinksInput {
  scriptId: string;
  seriesId: string;
}

interface iValidateEntityLinksInput {
  seriesId: string;
  links: Array<{
    entityType: string;
    entityId: string;
  }>;
}

@injectable()
export class ScriptKBIntegrationService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('script-kb-integration-service');
  }

  /**
   * Fast entity search for inline autocomplete
   *
   * Optimized for <200ms response time with regex matching
   */
  public async autocompleteSearch(input: iAutocompleteSearchInput): Promise<{
    items: AutocompleteSuggestion[];
    timing: { queryMs: number; totalMs: number };
  }> {
    const startTime = Date.now();

    // Verify series exists
    const series = await SeriesModel.findById(input.seriesId).lean();
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const queryStartTime = Date.now();
    const items = await this.searchEntities(input);
    const queryMs = Date.now() - queryStartTime;

    // Apply recently used prioritization
    if (input.context?.recentlyUsed?.length) {
      const recentSet = new Set(input.context.recentlyUsed);
      items.sort((a, b) => {
        const aRecent = recentSet.has(a._id) ? 0 : 1;
        const bRecent = recentSet.has(b._id) ? 0 : 1;
        return aRecent - bRecent;
      });
    }

    this.logger.debug('Autocomplete search completed', {
      seriesId: input.seriesId,
      entityType: input.entityType,
      query: input.query,
      resultCount: items.length,
      queryMs,
    });

    return {
      items: items.slice(0, input.limit),
      timing: {
        queryMs,
        totalMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Search entities by type with fuzzy matching
   */
  private async searchEntities(input: iAutocompleteSearchInput): Promise<AutocompleteSuggestion[]> {
    const { seriesId, entityType, query, limit } = input;

    // Build case-insensitive regex for fuzzy matching
    const searchRegex = query ? new RegExp(this.escapeRegex(query), 'i') : /.*/;
    const baseFilter = { seriesId };

    switch (entityType) {
      case AUTOCOMPLETE_ENTITY_TYPES.character: {
        const characters = await CharacterModel.find({
          ...baseFilter,
          name: searchRegex,
        })
          .select('_id name avatarUrl description')
          .limit(limit * 2)
          .lean();

        return characters.map((c) => ({
          _id: c._id,
          name: c.name,
          avatarUrl: c.avatarUrl,
          preview: c.description?.slice(0, 100),
          usageCount: c.appearances?.length ?? 0,
        }));
      }

      case AUTOCOMPLETE_ENTITY_TYPES.location: {
        const locations = await LocationModel.find({
          ...baseFilter,
          name: searchRegex,
        })
          .select('_id name images description mood')
          .limit(limit * 2)
          .lean();

        return locations.map((l) => ({
          _id: l._id,
          name: l.name,
          avatarUrl: l.images?.[0]?.url,
          preview: l.description?.slice(0, 100) ?? l.mood,
        }));
      }

      case AUTOCOMPLETE_ENTITY_TYPES.prop: {
        const props = await PropModel.find({
          ...baseFilter,
          name: searchRegex,
        })
          .select('_id name description')
          .limit(limit * 2)
          .lean();

        return props.map((p) => ({
          _id: p._id,
          name: p.name,
          preview: p.description?.slice(0, 100),
        }));
      }

      case AUTOCOMPLETE_ENTITY_TYPES.wildcard: {
        const wildcards = await WildCardModel.find({
          ...baseFilter,
          $or: [{ title: searchRegex }, { tag: searchRegex }],
        })
          .select('_id title body tag')
          .limit(limit * 2)
          .lean();

        return wildcards.map((w) => ({
          _id: w._id,
          name: w.title,
          preview: w.body?.slice(0, 100) ?? w.tag,
        }));
      }

      case AUTOCOMPLETE_ENTITY_TYPES.theme: {
        const themes = await ThemeModel.find({
          ...baseFilter,
          name: searchRegex,
        })
          .select('_id name description color')
          .limit(limit * 2)
          .lean();

        return themes.map((t) => ({
          _id: t._id,
          name: t.name,
          preview: t.description?.slice(0, 100),
        }));
      }

      case AUTOCOMPLETE_ENTITY_TYPES.storyArc: {
        const arcs = await StoryArcModel.find({
          ...baseFilter,
          name: searchRegex,
        })
          .select('_id name description status')
          .limit(limit * 2)
          .lean();

        return arcs.map((a) => ({
          _id: a._id,
          name: a.name,
          preview: a.description?.slice(0, 100) ?? a.status,
        }));
      }

      default:
        return [];
    }
  }

  /**
   * Bulk sync entity appearances from script save
   *
   * Uses bulkWrite operations for efficiency instead of individual updates.
   */
  public async syncAppearances(input: iSyncAppearancesInput): Promise<{
    updated: number;
    added: number;
    removed: number;
    version: number;
  }> {
    const { scriptId, seriesId, appearances } = input;

    // Verify script exists
    const script = await ScriptModel.findById(scriptId).lean();
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    // Group appearances by entity type
    const appearancesByType = this.groupAppearancesByType(appearances);

    // Process character appearances with bulkWrite
    const characterStats = await this.syncCharacterAppearances(
      appearancesByType.get(APPEARANCE_ENTITY_TYPES.character) ?? [],
      scriptId,
      seriesId,
    );

    // Process scene updates (props and characters) with bulkWrite
    const sceneStats = await this.syncSceneEntities(
      appearancesByType.get(APPEARANCE_ENTITY_TYPES.character) ?? [],
      appearancesByType.get(APPEARANCE_ENTITY_TYPES.prop) ?? [],
      seriesId,
    );

    const stats = {
      updated: sceneStats.updated,
      added: characterStats.added,
      removed: characterStats.removed,
      version: Date.now(),
    };

    this.logger.info('Synced appearances', { scriptId, seriesId, ...stats });

    return stats;
  }

  /**
   * Group appearances by entity type
   */
  private groupAppearancesByType(appearances: AppearanceRecord[]): Map<AppearanceEntityType, AppearanceRecord[]> {
    const map = new Map<AppearanceEntityType, AppearanceRecord[]>();
    for (const appearance of appearances) {
      const list = map.get(appearance.entityType) ?? [];
      list.push(appearance);
      map.set(appearance.entityType, list);
    }
    return map;
  }

  /**
   * Sync character appearances using direct updates
   *
   * Note: We use sequential updates here due to MongoDB pull/push atomicity requirements.
   * For high-volume scenarios, consider using an event-sourcing approach.
   */
  private async syncCharacterAppearances(
    characterAppearances: AppearanceRecord[],
    scriptId: string,
    seriesId: string,
  ): Promise<{ added: number; removed: number }> {
    const characterIdSet = new Set(characterAppearances.map((a) => a.entityId));
    if (characterIdSet.size === 0) {
      return { added: 0, removed: 0 };
    }

    // First, remove all old appearances for this script from all characters
    const removeResult = await CharacterModel.updateMany(
      { _id: { $in: [...characterIdSet] }, seriesId },
      { $pull: { appearances: { scriptId } } },
    );

    // Then, add new appearances in a single batch for each character
    const addPromises = [...characterIdSet].map(async (characterId) => {
      const sceneRefs = characterAppearances.filter((a) => a.entityId === characterId).map((a) => a.sceneRef);

      if (sceneRefs.length > 0) {
        return CharacterModel.updateOne(
          { _id: characterId, seriesId },
          {
            $push: {
              appearances: { $each: sceneRefs.map((sceneRef) => ({ scriptId, sceneRef })) },
            },
          },
        );
      }
      return null;
    });

    const addResults = await Promise.all(addPromises);
    const totalAdded = addResults.filter(Boolean).length;

    return {
      added: totalAdded,
      removed: removeResult.modifiedCount,
    };
  }

  /**
   * Sync scene entity references (characterIds, propIds) using bulkWrite
   */
  private async syncSceneEntities(
    characterAppearances: AppearanceRecord[],
    propAppearances: AppearanceRecord[],
    seriesId: string,
  ): Promise<{ updated: number }> {
    // Group by scene
    const charactersByScene = new Map<string, string[]>();
    const propsByScene = new Map<string, string[]>();

    for (const appearance of characterAppearances) {
      if (appearance.sceneId) {
        const list = charactersByScene.get(appearance.sceneId) ?? [];
        list.push(appearance.entityId);
        charactersByScene.set(appearance.sceneId, list);
      }
    }

    for (const appearance of propAppearances) {
      if (appearance.sceneId) {
        const list = propsByScene.get(appearance.sceneId) ?? [];
        list.push(appearance.entityId);
        propsByScene.set(appearance.sceneId, list);
      }
    }

    // Build bulkWrite operations
    const bulkOps: Parameters<typeof SceneModel.bulkWrite>[0] = [];

    // Collect all scene IDs to update
    const allSceneIds = new Set([...charactersByScene.keys(), ...propsByScene.keys()]);

    for (const sceneId of allSceneIds) {
      const update: Record<string, unknown> = {};
      const characterIds = charactersByScene.get(sceneId);
      const propIds = propsByScene.get(sceneId);

      if (characterIds) {
        update.characterIds = characterIds;
      }
      if (propIds) {
        update.propIds = propIds;
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: sceneId, seriesId },
          update: { $set: update },
        },
      });
    }

    if (bulkOps.length === 0) {
      return { updated: 0 };
    }

    const result = await SceneModel.bulkWrite(bulkOps);
    return { updated: result.modifiedCount };
  }

  /**
   * Quick create entity from script autocomplete
   */
  public async quickCreateEntity(input: iQuickCreateEntityInput): Promise<{
    entity: { _id: string; name: string; seriesId: string };
  }> {
    const { seriesId, entityType, name, description, initialAppearance } = input;

    // Verify series exists
    const series = await SeriesModel.findById(seriesId).lean();
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    let entity: { _id: string; name: string; seriesId: string };

    switch (entityType) {
      case 'character': {
        const character = await CharacterModel.create({
          seriesId,
          name,
          description,
          appearances: initialAppearance
            ? [{ scriptId: initialAppearance.scriptId, sceneRef: initialAppearance.sceneRef }]
            : [],
        });
        entity = { _id: character._id, name: character.name, seriesId: character.seriesId };
        break;
      }

      case 'location': {
        const location = await LocationModel.create({
          seriesId,
          name,
          description,
        });
        entity = { _id: location._id, name: location.name, seriesId: location.seriesId };
        break;
      }

      case 'prop': {
        const prop = await PropModel.create({
          seriesId,
          name,
          description,
        });
        entity = { _id: prop._id, name: prop.name, seriesId: prop.seriesId };
        break;
      }

      case 'wildcard': {
        const wildcard = await WildCardModel.create({
          seriesId,
          title: name,
          body: description,
        });
        entity = { _id: wildcard._id, name: wildcard.title, seriesId: wildcard.seriesId };
        break;
      }

      default:
        throw ORPCNotFoundError(errorCodes.KB_ENTITY_NOT_FOUND);
    }

    this.logger.info('Quick created entity', { entityType, entityId: entity._id, seriesId });

    return { entity };
  }

  /**
   * Ensure Scene entity exists for a script scene (idempotent)
   */
  public async ensureScene(input: iEnsureSceneInput): Promise<{
    scene: {
      _id: string;
      heading: string;
      sceneNumber: number;
      locationId?: string;
      isNew: boolean;
    };
  }> {
    const { scriptId, seriesId, heading, sceneNumber, locationId, timeOfDay } = input;

    // Verify script exists
    const script = await ScriptModel.findById(scriptId).lean();
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    // Try to find existing scene by scriptId + sceneNumber
    const existingScene = await SceneModel.findOne({ scriptId, sceneNumber }).lean();

    if (existingScene) {
      // Update heading and locationId if changed
      if (existingScene.heading !== heading || existingScene.locationId !== locationId) {
        await SceneModel.updateOne(
          { _id: existingScene._id },
          { $set: { heading, locationId, timeOfDay, lastEditedAt: new Date() } },
        );
      }

      return {
        scene: {
          _id: existingScene._id,
          heading: existingScene.heading,
          sceneNumber: existingScene.sceneNumber,
          locationId: existingScene.locationId,
          isNew: false,
        },
      };
    }

    // Create new scene
    const newScene = await SceneModel.create({
      scriptId,
      seriesId,
      heading,
      sceneNumber,
      locationId,
      timeOfDay,
      characterIds: [],
      propIds: [],
      beats: [],
    });

    this.logger.info('Created new scene', { sceneId: newScene._id, scriptId, sceneNumber });

    return {
      scene: {
        _id: newScene._id,
        heading: newScene.heading,
        sceneNumber: newScene.sceneNumber,
        locationId: newScene.locationId,
        isNew: true,
      },
    };
  }

  /**
   * Poll for entity updates since a given version (WebSocket-ready)
   */
  public async pollEntityUpdates(input: iPollEntityUpdatesInput): Promise<{
    updates: Array<{
      entityType: string;
      entityId: string;
      action: 'created' | 'updated' | 'deleted';
      patch?: Record<string, unknown>;
      timestamp: Date;
      version: number;
    }>;
    currentVersion: number;
    hasMore: boolean;
  }> {
    const { seriesId } = input;

    // Verify series exists
    const series = await SeriesModel.findById(seriesId).lean();
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    // For now, return empty updates - this will be replaced by WebSocket push
    // In a real implementation, we'd use change streams or a versioned changelog
    return {
      updates: [],
      currentVersion: Date.now(),
      hasMore: false,
    };
  }

  /**
   * Get entity links for a script
   */
  public async getScriptEntityLinks(input: iGetScriptEntityLinksInput): Promise<{
    links: Array<{
      entityType: string;
      entityId: string;
      entityName: string;
      exists: boolean;
    }>;
  }> {
    const { scriptId, seriesId } = input;

    // Get all scenes for this script
    const scenes = await SceneModel.find({ scriptId, seriesId }).lean();

    // Collect all entity IDs from scenes
    const entityIds = this.collectEntityIdsFromScenes(scenes);

    // Fetch all entities in parallel
    const [characters, locations, props] = await Promise.all([
      entityIds.characterIds.size > 0
        ? CharacterModel.find({ _id: { $in: [...entityIds.characterIds] }, seriesId })
            .select('_id name')
            .lean()
        : [],
      entityIds.locationIds.size > 0
        ? LocationModel.find({ _id: { $in: [...entityIds.locationIds] }, seriesId })
            .select('_id name')
            .lean()
        : [],
      entityIds.propIds.size > 0
        ? PropModel.find({ _id: { $in: [...entityIds.propIds] }, seriesId })
            .select('_id name')
            .lean()
        : [],
    ]);

    // Build links array
    const links = [
      ...this.buildEntityLinks('character', entityIds.characterIds, characters),
      ...this.buildEntityLinks('location', entityIds.locationIds, locations),
      ...this.buildEntityLinks('prop', entityIds.propIds, props),
    ];

    return { links };
  }

  /**
   * Collect entity IDs from scenes
   */
  private collectEntityIdsFromScenes(
    scenes: Array<{ locationId?: string; characterIds?: string[]; propIds?: string[] }>,
  ) {
    const characterIds = new Set<string>();
    const propIds = new Set<string>();
    const locationIds = new Set<string>();

    for (const scene of scenes) {
      if (scene.locationId) locationIds.add(scene.locationId);
      for (const charId of scene.characterIds ?? []) characterIds.add(charId);
      for (const propId of scene.propIds ?? []) propIds.add(propId);
    }

    return { characterIds, locationIds, propIds };
  }

  /**
   * Build entity link records
   */
  private buildEntityLinks(
    entityType: string,
    entityIds: Set<string>,
    entities: Array<{ _id: string; name?: string; title?: string }>,
  ): Array<{ entityType: string; entityId: string; entityName: string; exists: boolean }> {
    const entityMap = new Map(entities.map((e) => [e._id, e]));
    const links: Array<{ entityType: string; entityId: string; entityName: string; exists: boolean }> = [];

    for (const entityId of entityIds) {
      const entity = entityMap.get(entityId);
      links.push({
        entityType,
        entityId,
        entityName: entity?.name ?? entity?.title ?? 'Unknown',
        exists: entityMap.has(entityId),
      });
    }

    return links;
  }

  /**
   * Validate entity links exist
   */
  public async validateEntityLinks(input: iValidateEntityLinksInput): Promise<{
    orphaned: string[];
    valid: string[];
  }> {
    const { seriesId, links } = input;

    // Group by entity type
    const byType = new Map<string, string[]>();
    for (const link of links) {
      const list = byType.get(link.entityType) ?? [];
      list.push(link.entityId);
      byType.set(link.entityType, list);
    }

    // Fetch all entity types in parallel
    const existingIdsByType = await this.fetchExistingEntityIds(byType, seriesId);

    // Categorize as valid or orphaned
    const orphaned: string[] = [];
    const valid: string[] = [];

    for (const link of links) {
      const existingIds = existingIdsByType.get(link.entityType) ?? new Set();
      if (existingIds.has(link.entityId)) {
        valid.push(link.entityId);
      } else {
        orphaned.push(link.entityId);
      }
    }

    return { orphaned, valid };
  }

  /**
   * Fetch existing entity IDs for multiple types in parallel
   */
  private async fetchExistingEntityIds(
    byType: Map<string, string[]>,
    seriesId: string,
  ): Promise<Map<string, Set<string>>> {
    const results = new Map<string, Set<string>>();

    const fetchPromises = [...byType.entries()].map(async ([entityType, ids]) => {
      const existingIds = await this.fetchEntityIds(entityType, ids, seriesId);
      results.set(entityType, existingIds);
    });

    await Promise.all(fetchPromises);
    return results;
  }

  /**
   * Fetch existing IDs for a single entity type
   */
  private async fetchEntityIds(entityType: string, ids: string[], seriesId: string): Promise<Set<string>> {
    const filter = { _id: { $in: ids }, seriesId };
    const projection = { _id: 1 };

    switch (entityType) {
      case 'character': {
        const entities = await CharacterModel.find(filter).select(projection).lean();
        return new Set(entities.map((e) => e._id));
      }
      case 'location': {
        const entities = await LocationModel.find(filter).select(projection).lean();
        return new Set(entities.map((e) => e._id));
      }
      case 'prop': {
        const entities = await PropModel.find(filter).select(projection).lean();
        return new Set(entities.map((e) => e._id));
      }
      case 'wildcard': {
        const entities = await WildCardModel.find(filter).select(projection).lean();
        return new Set(entities.map((e) => e._id));
      }
      case 'theme': {
        const entities = await ThemeModel.find(filter).select(projection).lean();
        return new Set(entities.map((e) => e._id));
      }
      case 'storyArc': {
        const entities = await StoryArcModel.find(filter).select(projection).lean();
        return new Set(entities.map((e) => e._id));
      }
      default:
        return new Set();
    }
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  }
}

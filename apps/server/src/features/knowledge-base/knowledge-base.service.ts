import { inject, injectable } from 'tsyringe';

import { errorCodes } from '@kaeri/shared';

import { CharacterModel } from '@~/db/models/character.model';
import { LocationModel } from '@~/db/models/location.model';
import { PropModel } from '@~/db/models/prop.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TimelineEntryModel } from '@~/db/models/timeline-entry.model';
import { WildCardModel } from '@~/db/models/wildcard.model';
import { TOKENS } from '@~/di/tokens';
import { ORPCBadRequestError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { iKnowledgeBaseActionPayload } from '../events/events.constants';
import { EVENTS } from '../events/events.constants';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';

@injectable()
export class KnowledgeBaseService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('knowledge-base-service');
  }

  private readonly kbActionEventMap = {
    character: EVENTS.KNOWLEDGE_BASE_CHARACTER_ACTION,
    location: EVENTS.KNOWLEDGE_BASE_LOCATION_ACTION,
    prop: EVENTS.KNOWLEDGE_BASE_PROP_ACTION,
    timeline: EVENTS.KNOWLEDGE_BASE_TIMELINE_ACTION,
    wildcard: EVENTS.KNOWLEDGE_BASE_WILDCARD_ACTION,
  } as const;

  private emitKnowledgeBaseAction(
    seriesId: string,
    entityId: string,
    entityType: keyof typeof this.kbActionEventMap,
    action: iKnowledgeBaseActionPayload['action'],
  ) {
    this.eventBus.emit(this.kbActionEventMap[entityType], {
      seriesId,
      entityId,
      action,
    });
  }

  // Search across all KB entities
  public async search(seriesId: string, query: string, limit = 20, offset = 0) {
    // Verify series exists
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const searchRegex = new RegExp(query, 'i');

    const [characters, locations, props, timeline, wildcards] = await Promise.all([
      CharacterModel.find({ seriesId, name: searchRegex }).limit(limit).skip(offset).lean(),
      LocationModel.find({ seriesId, name: searchRegex }).limit(limit).skip(offset).lean(),
      PropModel.find({ seriesId, name: searchRegex }).limit(limit).skip(offset).lean(),
      TimelineEntryModel.find({ seriesId, label: searchRegex }).limit(limit).skip(offset).lean(),
      WildCardModel.find({ seriesId, title: searchRegex }).limit(limit).skip(offset).lean(),
    ]);

    const items = [
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...characters.map((c) => ({ ...c, _type: 'character' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...locations.map((l) => ({ ...l, _type: 'location' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...props.map((p) => ({ ...p, _type: 'prop' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...timeline.map((t) => ({ ...t, _type: 'timeline' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...wildcards.map((w) => ({ ...w, _type: 'wildcard' as const })),
    ].slice(0, limit);

    const total = characters.length + locations.length + props.length + timeline.length + wildcards.length;

    this.logger.info('KB search executed', { seriesId, query, resultsCount: items.length });
    return { items, total };
  }

  // Character CRUD
  public async createCharacter(
    seriesId: string,
    data: {
      name: string;
      description?: string;
      traits?: string[];
      avatarUrl?: string;
      relationships?: Array<{ targetId: string; type: string; note?: string }>;
      variations?: Array<{ scriptId: string; label: string; notes?: string }>;
      appearances?: Array<{ scriptId: string; sceneRef: string; locationId?: string }>;
    },
  ) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.name?.trim()) {
      throw ORPCBadRequestError(errorCodes.KB_NAME_REQUIRED);
    }

    const character = await CharacterModel.create({
      seriesId,
      name: data.name,
      description: data.description,
      traits: data.traits ?? [],
      relationships: data.relationships ?? [],
      variations: data.variations ?? [],
      appearances: data.appearances ?? [],
      avatarUrl: data.avatarUrl,
    });

    this.logger.info('Character created', { characterId: character._id, seriesId, name: character.name });
    this.emitKnowledgeBaseAction(seriesId, character._id, 'character', 'created');
    return character;
  }

  public async updateCharacter(
    id: string,
    seriesId: string,
    patch: {
      name?: string;
      description?: string;
      traits?: string[];
      avatarUrl?: string;
      relationships?: Array<{ targetId: string; type: string; note?: string }>;
      variations?: Array<{ scriptId: string; label: string; notes?: string }>;
      appearances?: Array<{ scriptId: string; sceneRef: string; locationId?: string }>;
    },
  ) {
    const character = await CharacterModel.findOne({ _id: id, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    if (patch.name !== undefined) character.name = patch.name;
    if (patch.description !== undefined) character.description = patch.description;
    if (patch.traits !== undefined) character.traits = patch.traits;
    if (patch.avatarUrl !== undefined) character.avatarUrl = patch.avatarUrl;
    if (patch.relationships !== undefined) character.relationships = patch.relationships;
    if (patch.variations !== undefined) character.variations = patch.variations;
    if (patch.appearances !== undefined) character.appearances = patch.appearances;

    await character.save();
    this.logger.info('Character updated', { characterId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'character', 'updated');
    return character;
  }

  public async deleteCharacter(id: string, seriesId: string) {
    const character = await CharacterModel.findOne({ _id: id, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    await CharacterModel.deleteOne({ _id: id });
    this.logger.info('Character deleted', { characterId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'character', 'deleted');
    return { success: true };
  }

  public async getCharacter(id: string, seriesId: string) {
    const character = await CharacterModel.findOne({ _id: id, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }
    return character;
  }

  public async listCharacters(seriesId: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      CharacterModel.find({ seriesId }).limit(limit).skip(offset).lean(),
      CharacterModel.countDocuments({ seriesId }),
    ]);

    return { items, total };
  }

  // Character relationships
  public async addRelationship(
    seriesId: string,
    characterId: string,
    relationship: { targetId: string; type: string; note?: string },
  ) {
    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    // Verify target character exists
    const target = await CharacterModel.findOne({ _id: relationship.targetId, seriesId });
    if (!target) {
      throw ORPCNotFoundError(errorCodes.RELATIONSHIP_TARGET_NOT_FOUND);
    }

    character.relationships = character.relationships ?? [];
    character.relationships.push(relationship);
    await character.save();

    this.logger.info('Relationship added', { characterId, targetId: relationship.targetId });
    this.emitKnowledgeBaseAction(seriesId, characterId, 'character', 'updated');
    return character;
  }

  public async removeRelationship(seriesId: string, characterId: string, targetId: string) {
    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    character.relationships = (character.relationships ?? []).filter((r) => r.targetId !== targetId);
    await character.save();

    this.logger.info('Relationship removed', { characterId, targetId });
    this.emitKnowledgeBaseAction(seriesId, characterId, 'character', 'updated');
    return character;
  }

  // Character appearances
  public async addAppearance(
    seriesId: string,
    characterId: string,
    appearance: { scriptId: string; sceneRef: string; locationId?: string },
  ) {
    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    character.appearances = character.appearances ?? [];
    character.appearances.push(appearance);
    await character.save();

    this.logger.info('Appearance added', { characterId, scriptId: appearance.scriptId });
    this.emitKnowledgeBaseAction(seriesId, characterId, 'character', 'updated');
    return character;
  }

  public async removeAppearance(seriesId: string, characterId: string, scriptId: string, sceneRef: string) {
    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    character.appearances = (character.appearances ?? []).filter(
      (a) => !(a.scriptId === scriptId && a.sceneRef === sceneRef),
    );
    await character.save();

    this.logger.info('Appearance removed', { characterId, scriptId, sceneRef });
    this.emitKnowledgeBaseAction(seriesId, characterId, 'character', 'updated');
    return character;
  }

  // Character variations
  public async addVariation(
    seriesId: string,
    characterId: string,
    variation: { scriptId: string; label: string; notes?: string },
  ) {
    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    character.variations = character.variations ?? [];
    character.variations.push(variation);
    await character.save();

    this.logger.info('Variation added', { characterId, scriptId: variation.scriptId });
    this.emitKnowledgeBaseAction(seriesId, characterId, 'character', 'updated');
    return character;
  }

  public async updateVariation(
    seriesId: string,
    characterId: string,
    scriptId: string,
    label: string,
    patch: { label?: string; notes?: string },
  ) {
    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    const variationIndex = (character.variations ?? []).findIndex((v) => v.scriptId === scriptId && v.label === label);

    if (variationIndex === -1) {
      throw ORPCNotFoundError(errorCodes.VARIATION_NOT_FOUND);
    }

    character.variations = character.variations ?? [];
    if (patch.label !== undefined) {
      character.variations[variationIndex].label = patch.label;
    }
    if (patch.notes !== undefined) {
      character.variations[variationIndex].notes = patch.notes;
    }

    await character.save();

    this.logger.info('Variation updated', { characterId, scriptId, label });
    this.emitKnowledgeBaseAction(seriesId, characterId, 'character', 'updated');
    return character;
  }

  public async removeVariation(seriesId: string, characterId: string, scriptId: string, label?: string) {
    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    character.variations = (character.variations ?? []).filter(
      (v) => !(v.scriptId === scriptId && (!label || v.label === label)),
    );
    await character.save();

    this.logger.info('Variation removed', { characterId, scriptId, label });
    this.emitKnowledgeBaseAction(seriesId, characterId, 'character', 'updated');
    return character;
  }

  // Location CRUD
  public async createLocation(seriesId: string, data: { name: string; description?: string; tags?: string[] }) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.name?.trim()) {
      throw ORPCBadRequestError(errorCodes.KB_NAME_REQUIRED);
    }

    const location = await LocationModel.create({
      seriesId,
      name: data.name,
      description: data.description,
      tags: data.tags ?? [],
      appearances: [],
    });

    this.logger.info('Location created', { locationId: location._id, seriesId, name: location.name });
    this.emitKnowledgeBaseAction(seriesId, location._id, 'location', 'created');
    return location;
  }

  public async updateLocation(
    id: string,
    seriesId: string,
    patch: {
      name?: string;
      description?: string;
      tags?: string[];
    },
  ) {
    const location = await LocationModel.findOne({ _id: id, seriesId });
    if (!location) {
      throw ORPCNotFoundError(errorCodes.LOCATION_NOT_FOUND);
    }

    if (patch.name !== undefined) location.name = patch.name;
    if (patch.description !== undefined) location.description = patch.description;
    if (patch.tags !== undefined) location.tags = patch.tags;

    await location.save();
    this.logger.info('Location updated', { locationId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'location', 'updated');
    return location;
  }

  public async deleteLocation(id: string, seriesId: string) {
    const location = await LocationModel.findOne({ _id: id, seriesId });
    if (!location) {
      throw ORPCNotFoundError(errorCodes.LOCATION_NOT_FOUND);
    }

    await LocationModel.deleteOne({ _id: id });
    this.logger.info('Location deleted', { locationId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'location', 'deleted');
    return { success: true };
  }

  public async getLocation(id: string, seriesId: string) {
    const location = await LocationModel.findOne({ _id: id, seriesId });
    if (!location) {
      throw ORPCNotFoundError(errorCodes.LOCATION_NOT_FOUND);
    }
    return location;
  }

  public async listLocations(seriesId: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      LocationModel.find({ seriesId }).limit(limit).skip(offset).lean(),
      LocationModel.countDocuments({ seriesId }),
    ]);

    return { items, total };
  }

  // Prop CRUD
  public async createProp(seriesId: string, data: { name: string; description?: string }) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.name?.trim()) {
      throw ORPCBadRequestError(errorCodes.KB_NAME_REQUIRED);
    }

    const prop = await PropModel.create({
      seriesId,
      name: data.name,
      description: data.description,
      associations: [],
    });

    this.logger.info('Prop created', { propId: prop._id, seriesId, name: prop.name });
    this.emitKnowledgeBaseAction(seriesId, prop._id, 'prop', 'created');
    return prop;
  }

  public async updateProp(id: string, seriesId: string, patch: { name?: string; description?: string }) {
    const prop = await PropModel.findOne({ _id: id, seriesId });
    if (!prop) {
      throw ORPCNotFoundError(errorCodes.PROP_NOT_FOUND);
    }

    if (patch.name !== undefined) prop.name = patch.name;
    if (patch.description !== undefined) prop.description = patch.description;

    await prop.save();
    this.logger.info('Prop updated', { propId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'prop', 'updated');
    return prop;
  }

  public async deleteProp(id: string, seriesId: string) {
    const prop = await PropModel.findOne({ _id: id, seriesId });
    if (!prop) {
      throw ORPCNotFoundError(errorCodes.PROP_NOT_FOUND);
    }

    await PropModel.deleteOne({ _id: id });
    this.logger.info('Prop deleted', { propId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'prop', 'deleted');
    return { success: true };
  }

  public async getProp(id: string, seriesId: string) {
    const prop = await PropModel.findOne({ _id: id, seriesId });
    if (!prop) {
      throw ORPCNotFoundError(errorCodes.PROP_NOT_FOUND);
    }
    return prop;
  }

  public async listProps(seriesId: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      PropModel.find({ seriesId }).limit(limit).skip(offset).lean(),
      PropModel.countDocuments({ seriesId }),
    ]);

    return { items, total };
  }

  // Timeline CRUD
  public async createTimelineEntry(
    seriesId: string,
    data: {
      label: string;
      order?: number;
      timestamp?: string;
      links?: Array<{ entityType: string; entityId: string }>;
    },
  ) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.label?.trim()) {
      throw ORPCBadRequestError(errorCodes.KB_NAME_REQUIRED);
    }

    const entry = await TimelineEntryModel.create({
      seriesId,
      label: data.label,
      order: data.order,
      timestamp: data.timestamp,
      links: data.links ?? [],
    });

    this.logger.info('Timeline entry created', { timelineId: entry._id, seriesId, label: entry.label });
    this.emitKnowledgeBaseAction(seriesId, entry._id, 'timeline', 'created');
    return entry;
  }

  public async updateTimelineEntry(
    id: string,
    seriesId: string,
    patch: {
      label?: string;
      order?: number;
      timestamp?: string;
      links?: Array<{ entityType: string; entityId: string }>;
    },
  ) {
    const entry = await TimelineEntryModel.findOne({ _id: id, seriesId });
    if (!entry) {
      throw ORPCNotFoundError(errorCodes.TIMELINE_ENTRY_NOT_FOUND);
    }

    if (patch.label !== undefined) entry.label = patch.label;
    if (patch.order !== undefined) entry.order = patch.order;
    if (patch.timestamp !== undefined) entry.timestamp = patch.timestamp;
    if (patch.links !== undefined) entry.links = patch.links;

    await entry.save();
    this.logger.info('Timeline entry updated', { timelineId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'timeline', 'updated');
    return entry;
  }

  public async deleteTimelineEntry(id: string, seriesId: string) {
    const entry = await TimelineEntryModel.findOne({ _id: id, seriesId });
    if (!entry) {
      throw ORPCNotFoundError(errorCodes.TIMELINE_ENTRY_NOT_FOUND);
    }

    await TimelineEntryModel.deleteOne({ _id: id });
    this.logger.info('Timeline entry deleted', { timelineId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'timeline', 'deleted');
    return { success: true };
  }

  public async getTimelineEntry(id: string, seriesId: string) {
    const entry = await TimelineEntryModel.findOne({ _id: id, seriesId });
    if (!entry) {
      throw ORPCNotFoundError(errorCodes.TIMELINE_ENTRY_NOT_FOUND);
    }
    return entry;
  }

  public async listTimelineEntries(seriesId: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      TimelineEntryModel.find({ seriesId }).sort({ order: 1 }).limit(limit).skip(offset).lean(),
      TimelineEntryModel.countDocuments({ seriesId }),
    ]);

    return { items, total };
  }

  // WildCard CRUD
  public async createWildCard(seriesId: string, data: { title: string; body?: string; tag?: string }) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.title?.trim()) {
      throw ORPCBadRequestError(errorCodes.KB_NAME_REQUIRED);
    }

    const wildcard = await WildCardModel.create({
      seriesId,
      title: data.title,
      body: data.body,
      tag: data.tag,
    });

    this.logger.info('WildCard created', { wildCardId: wildcard._id, seriesId, title: wildcard.title });
    this.emitKnowledgeBaseAction(seriesId, wildcard._id, 'wildcard', 'created');
    return wildcard;
  }

  public async updateWildCard(id: string, seriesId: string, patch: { title?: string; body?: string; tag?: string }) {
    const wildcard = await WildCardModel.findOne({ _id: id, seriesId });
    if (!wildcard) {
      throw ORPCNotFoundError(errorCodes.WILDCARD_NOT_FOUND);
    }

    if (patch.title !== undefined) wildcard.title = patch.title;
    if (patch.body !== undefined) wildcard.body = patch.body;
    if (patch.tag !== undefined) wildcard.tag = patch.tag;

    await wildcard.save();
    this.logger.info('WildCard updated', { wildCardId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'wildcard', 'updated');
    return wildcard;
  }

  public async deleteWildCard(id: string, seriesId: string) {
    const wildcard = await WildCardModel.findOne({ _id: id, seriesId });
    if (!wildcard) {
      throw ORPCNotFoundError(errorCodes.WILDCARD_NOT_FOUND);
    }

    await WildCardModel.deleteOne({ _id: id });
    this.logger.info('WildCard deleted', { wildCardId: id });
    this.emitKnowledgeBaseAction(seriesId, id, 'wildcard', 'deleted');
    return { success: true };
  }

  public async getWildCard(id: string, seriesId: string) {
    const wildcard = await WildCardModel.findOne({ _id: id, seriesId });
    if (!wildcard) {
      throw ORPCNotFoundError(errorCodes.WILDCARD_NOT_FOUND);
    }
    return wildcard;
  }

  public async listWildCards(seriesId: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      WildCardModel.find({ seriesId }).limit(limit).skip(offset).lean(),
      WildCardModel.countDocuments({ seriesId }),
    ]);

    return { items, total };
  }
}

import { injectable, inject } from 'tsyringe';

import { errorCodes } from '@kaeri/shared/enums/errors.enums';

import { AuditEntryModel } from '@~/db/models/audit-entry.model';
import { CharacterModel } from '@~/db/models/character.model';
import { LocationModel } from '@~/db/models/location.model';
import { PropModel } from '@~/db/models/prop.model';
import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TimelineEntryModel } from '@~/db/models/timeline-entry.model';
import { TOKENS } from '@~/di/tokens';
import type { LoggerFactory, iWithLogger } from '@~/features/logger/logger.types';
import { ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

@injectable()
export class ContinuityService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('continuity-service');
  }

  /**
   * Build continuity graph with nodes (entities) and edges (relationships)
   */
  public async continuityGraph(seriesId: string) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    // Fetch all entities that form the graph nodes
    const [characters, locations, props, scripts, timeline] = await Promise.all([
      CharacterModel.find({ seriesId }).lean(),
      LocationModel.find({ seriesId }).lean(),
      PropModel.find({ seriesId }).lean(),
      ScriptModel.find({ seriesId }).select('-content -contentVersion').lean(),
      TimelineEntryModel.find({ seriesId }).lean(),
    ]);

    // Build nodes with type discriminator
    const nodes = [
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...characters.map((c) => ({ ...c, type: 'character' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...locations.map((l) => ({ ...l, type: 'location' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...props.map((p) => ({ ...p, type: 'prop' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...scripts.map((s) => ({ ...s, type: 'script' as const })),
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...timeline.map((t) => ({ ...t, type: 'timeline' as const })),
    ];

    // Build edges from relationships and appearances
    const edges = [];

    // Character relationships
    for (const char of characters) {
      if (char.relationships) {
        for (const rel of char.relationships) {
          edges.push({
            type: 'relationship' as const,
            fromId: char._id,
            toId: rel.targetId,
            metadata: { note: rel.note ?? rel.type },
          });
        }
      }

      // Character appearances
      if (char.appearances) {
        for (const appearance of char.appearances) {
          edges.push({
            type: 'appearance' as const,
            fromId: char._id,
            toId: appearance.scriptId,
            metadata: {
              sceneRef: appearance.sceneRef,
              locationId: appearance.locationId,
            },
          });

          // Link to location if present
          if (appearance.locationId) {
            edges.push({
              type: 'location-of' as const,
              fromId: appearance.locationId,
              toId: appearance.scriptId,
              metadata: { sceneRef: appearance.sceneRef },
            });
          }
        }
      }
    }

    // Prop associations (prop appears in script)
    for (const prop of props) {
      if (prop.associations) {
        for (const assoc of prop.associations) {
          if (assoc.scriptId) {
            edges.push({
              type: 'prop-in-scene' as const,
              fromId: prop._id,
              toId: assoc.scriptId,
              metadata: { note: assoc.note },
            });
          }
        }
      }
    }

    this.logger.info('Continuity graph built', {
      seriesId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });

    return { nodes, edges };
  }

  /**
   * Get all appearances for a specific character
   */
  public async appearancesByCharacter(seriesId: string, characterId: string) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const character = await CharacterModel.findOne({ _id: characterId, seriesId });
    if (!character) {
      throw ORPCNotFoundError(errorCodes.CHARACTER_NOT_FOUND);
    }

    const appearances = character.appearances ?? [];

    this.logger.info('Character appearances retrieved', {
      seriesId,
      characterId,
      appearanceCount: appearances.length,
    });

    return appearances as Array<{ scriptId: string; sceneRef: string; locationId?: string }>;
  }

  /**
   * Get audit log entries for a specific entity
   */
  public async auditListByEntity(seriesId: string, entityType: string, entityId: string, offset = 0, limit = 20) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      AuditEntryModel.find({ seriesId, entityType, entityId }).sort({ timestamp: -1 }).skip(offset).limit(limit).lean(),
      AuditEntryModel.countDocuments({ seriesId, entityType, entityId }),
    ]);

    this.logger.info('Audit entries retrieved by entity', {
      seriesId,
      entityType,
      entityId,
      resultCount: items.length,
      total,
    });

    return { items, total };
  }

  /**
   * Get audit log entries for entire series
   */
  public async auditListBySeries(seriesId: string, offset = 0, limit = 20) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      AuditEntryModel.find({ seriesId }).sort({ timestamp: -1 }).skip(offset).limit(limit).lean(),
      AuditEntryModel.countDocuments({ seriesId }),
    ]);

    this.logger.info('Audit entries retrieved by series', {
      seriesId,
      resultCount: items.length,
      total,
    });

    return { items, total };
  }
}

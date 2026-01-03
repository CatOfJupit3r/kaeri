import { injectable, inject } from 'tsyringe';

import { errorCodes } from '@kaeri/shared/enums/errors.enums';

import { CanvasEdgeModel } from '@~/db/models/canvas-edge.model';
import { CanvasNodeModel } from '@~/db/models/canvas-node.model';
import { CharacterModel } from '@~/db/models/character.model';
import { LocationModel } from '@~/db/models/location.model';
import { PropModel } from '@~/db/models/prop.model';
import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TimelineEntryModel } from '@~/db/models/timeline-entry.model';
import { WildCardModel } from '@~/db/models/wildcard.model';
import { TOKENS } from '@~/di/tokens';
import type { LoggerFactory, iWithLogger } from '@~/features/logger/logger.types';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import { ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { ValkeyService } from '../valkey/valkey.service';

@injectable()
export class ExportService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
  ) {
    this.logger = loggerFactory.create('export-service');
  }

  /**
   * Export script as PDF (placeholder - actual PDF generation would use pdf-lib)
   * Returns metadata; actual implementation would stream binary data
   */
  public async exportScriptPdf(scriptId: string) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    // TODO: Implement actual PDF generation using pdf-lib
    // For now, return success metadata
    this.logger.info('Script PDF export initiated', { scriptId, title: script.title });

    return {
      ok: true as const,
      fileType: 'application/pdf' as const,
    };
  }

  /**
   * Export complete series data as JSON backup
   */
  public async exportSeriesJson(seriesId: string) {
    return this.valkey.cached(buildCacheKey.exportSeriesJson(seriesId), CACHE_TTL.LIST_MEDIUM, async () => {
      this.logger.debug('Exporting series JSON from database', { seriesId });
      const series = await SeriesModel.findById(seriesId).lean();
      if (!series) {
        throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
      }

      // Fetch all related data in parallel
      const [scripts, characters, locations, props, timeline, wildcards, canvasNodes, canvasEdges] = await Promise.all([
        ScriptModel.find({ seriesId }).select('-content -contentVersion').lean(),
        CharacterModel.find({ seriesId }).lean(),
        LocationModel.find({ seriesId }).lean(),
        PropModel.find({ seriesId }).lean(),
        TimelineEntryModel.find({ seriesId }).lean(),
        WildCardModel.find({ seriesId }).lean(),
        CanvasNodeModel.find({ seriesId }).lean(),
        CanvasEdgeModel.find({ seriesId }).lean(),
      ]);

      // Collect all appearances from characters
      const appearances = characters.flatMap((char) => char.appearances ?? []);

      const exportData = {
        series,
        scripts,
        characters,
        locations,
        props,
        timeline,
        wildcards,
        appearances,
        canvas: {
          nodes: canvasNodes,
          edges: canvasEdges,
        },
      };

      this.logger.info('Series JSON export completed', {
        seriesId,
        title: series.title,
        scriptCount: scripts.length,
        characterCount: characters.length,
      });

      return exportData;
    });
  }
}

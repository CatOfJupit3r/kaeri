import { injectable, inject } from 'tsyringe';

import { errorCodes } from '@kaeri/shared/enums/errors.enums';
import type {
  CreateExportPresetInput,
  UpdateExportPresetInput,
  ExportScriptPdfOptions,
  ExportPreset,
} from '@kaeri/shared/schemas/export-preset.schema';

import { CanvasEdgeModel } from '@~/db/models/canvas-edge.model';
import { CanvasNodeModel } from '@~/db/models/canvas-node.model';
import { CharacterModel } from '@~/db/models/character.model';
import { ExportPresetModel } from '@~/db/models/export-preset.model';
import { LocationModel } from '@~/db/models/location.model';
import { PropModel } from '@~/db/models/prop.model';
import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TimelineEntryModel } from '@~/db/models/timeline-entry.model';
import { WildCardModel } from '@~/db/models/wildcard.model';
import { TOKENS } from '@~/di/tokens';
import type { LoggerFactory, iWithLogger } from '@~/features/logger/logger.types';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import { ORPCBadRequestError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { ValkeyService } from '../valkey/valkey.service';
import { PdfGeneratorService } from './pdf-generator.service';

/**
 * Default export preset for standard screenplay formatting
 */
const DEFAULT_PRESET: Omit<ExportPreset, '_id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'Standard Screenplay',
  description: 'Industry-standard screenplay formatting based on Hollywood guidelines.',
  isSystem: true,
  pageSize: 'LETTER',
  margins: { top: 1, bottom: 1, left: 1.5, right: 1 },
  headerFooter: {
    showPageNumbers: true,
    pageNumberPosition: 'top-right',
    showTitle: false,
    showDate: false,
  },
  fontFamily: 'Courier',
  baseFontSize: 12,
  lineHeight: 1,
  sceneHeadingStyle: {
    fontSize: 12,
    bold: true,
    italic: false,
    uppercase: true,
    alignment: 'left',
    marginLeft: 0,
    marginRight: 0,
    spaceBefore: 24,
    spaceAfter: 12,
    color: '#000000',
  },
  actionStyle: {
    fontSize: 12,
    bold: false,
    italic: false,
    uppercase: false,
    alignment: 'left',
    marginLeft: 0,
    marginRight: 0,
    spaceBefore: 12,
    spaceAfter: 0,
    color: '#000000',
  },
  characterStyle: {
    fontSize: 12,
    bold: true,
    italic: false,
    uppercase: true,
    alignment: 'left',
    marginLeft: 2.2,
    marginRight: 0,
    spaceBefore: 12,
    spaceAfter: 0,
    color: '#000000',
  },
  dialogueStyle: {
    fontSize: 12,
    bold: false,
    italic: false,
    uppercase: false,
    alignment: 'left',
    marginLeft: 1,
    marginRight: 1.5,
    spaceBefore: 0,
    spaceAfter: 0,
    color: '#000000',
  },
  parentheticalStyle: {
    fontSize: 12,
    bold: false,
    italic: true,
    uppercase: false,
    alignment: 'left',
    marginLeft: 1.6,
    marginRight: 2.1,
    spaceBefore: 0,
    spaceAfter: 0,
    color: '#000000',
  },
  transitionStyle: {
    fontSize: 12,
    bold: true,
    italic: false,
    uppercase: true,
    alignment: 'right',
    marginLeft: 0,
    marginRight: 0,
    spaceBefore: 12,
    spaceAfter: 12,
    color: '#000000',
  },
};

@injectable()
export class ExportService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  private pdfGenerator: PdfGeneratorService;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
  ) {
    this.logger = loggerFactory.create('export-service');
    this.pdfGenerator = new PdfGeneratorService();
  }

  // ============================================================================
  // EXPORT PRESET MANAGEMENT
  // ============================================================================

  /**
   * Create a new export preset for the user
   */
  public async createExportPreset(userId: string, input: CreateExportPresetInput) {
    this.logger.debug('Creating export preset', { userId, name: input.name });

    const preset = await ExportPresetModel.create({
      ...input,
      userId,
      isSystem: false,
    });

    this.logger.info('Export preset created', { presetId: preset._id, name: preset.name });
    return preset.toObject();
  }

  /**
   * List all export presets for a user (including system defaults)
   */
  public async listExportPresets(userId: string) {
    // Fetch user presets and system presets
    const presets = await ExportPresetModel.find({
      $or: [{ userId }, { isSystem: true }],
    })
      .sort({ isSystem: -1, name: 1 })
      .lean();

    // If no system preset exists, create a virtual one
    const hasSystemPreset = presets.some((p) => p.isSystem);
    if (!hasSystemPreset) {
      const virtualSystemPreset = {
        ...DEFAULT_PRESET,
        _id: 'default-screenplay',
        userId: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return [virtualSystemPreset, ...presets];
    }

    return presets;
  }

  /**
   * Get a single export preset by ID
   */
  public async getExportPreset(userId: string, presetId: string) {
    // Handle virtual default preset
    if (presetId === 'default-screenplay') {
      return {
        ...DEFAULT_PRESET,
        _id: 'default-screenplay',
        userId: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const preset = await ExportPresetModel.findById(presetId).lean();

    if (!preset) {
      throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
    }

    // Check access - user can access their own presets or system presets
    if (preset.userId !== userId && !preset.isSystem) {
      throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
    }

    return preset;
  }

  /**
   * Update an existing export preset
   */
  public async updateExportPreset(userId: string, input: UpdateExportPresetInput) {
    const { presetId, ...updates } = input;

    const preset = await ExportPresetModel.findById(presetId);

    if (!preset) {
      throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
    }

    if (preset.userId !== userId) {
      throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
    }

    if (preset.isSystem) {
      throw ORPCBadRequestError(errorCodes.CANNOT_MODIFY_SYSTEM_PRESET);
    }

    Object.assign(preset, updates);
    await preset.save();

    this.logger.info('Export preset updated', { presetId, name: preset.name });
    return preset.toObject();
  }

  /**
   * Delete an export preset
   */
  public async deleteExportPreset(userId: string, presetId: string) {
    const preset = await ExportPresetModel.findById(presetId);

    if (!preset) {
      throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
    }

    if (preset.userId !== userId) {
      throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
    }

    if (preset.isSystem) {
      throw ORPCBadRequestError(errorCodes.CANNOT_MODIFY_SYSTEM_PRESET);
    }

    await preset.deleteOne();

    this.logger.info('Export preset deleted', { presetId });
    return { success: true as const };
  }

  /**
   * Duplicate an existing preset (allows copying system presets)
   */
  public async duplicateExportPreset(userId: string, presetId: string, newName?: string): Promise<ExportPreset> {
    let sourcePreset: ExportPreset;

    // Handle virtual default preset
    if (presetId === 'default-screenplay') {
      sourcePreset = {
        ...DEFAULT_PRESET,
        _id: 'default-screenplay',
        userId: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      const preset = await ExportPresetModel.findById(presetId).lean();

      if (!preset) {
        throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
      }

      // Check access
      if (preset.userId !== userId && !preset.isSystem) {
        throw ORPCNotFoundError(errorCodes.EXPORT_PRESET_NOT_FOUND);
      }

      sourcePreset = preset as ExportPreset;
    }

    // Create duplicate with new name
    const duplicateName = newName ?? `${sourcePreset.name} (Copy)`;
    const {
      _id: sourceId,
      userId: unusedUserId,
      isSystem,
      createdAt: unusedCreatedAt,
      updatedAt: unusedUpdatedAt,
      ...presetData
    } = sourcePreset;

    // Suppress unused variable warnings
    void sourceId;
    void unusedUserId;
    void isSystem;
    void unusedCreatedAt;
    void unusedUpdatedAt;

    const newPreset = await ExportPresetModel.create({
      ...presetData,
      name: duplicateName,
      userId,
      isSystem: false,
    });

    this.logger.info('Export preset duplicated', {
      sourcePresetId: presetId,
      newPresetId: newPreset._id,
      name: duplicateName,
    });

    return newPreset.toObject();
  }

  // ============================================================================
  // PDF EXPORT
  // ============================================================================

  /**
   * Export script as PDF with preset styling
   */
  public async exportScriptPdf(userId: string, options: ExportScriptPdfOptions) {
    const { scriptId, presetId } = options;

    // Get script
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    // Verify the script's series exists
    // TODO: Add series ownership check when multi-user support is implemented
    const series = await SeriesModel.findById(script.seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    // Get preset or use default
    let preset: ExportPreset;
    if (presetId) {
      preset = await this.getExportPreset(userId, presetId);
    } else {
      preset = {
        ...DEFAULT_PRESET,
        _id: 'default-screenplay',
        userId: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    this.logger.info('Generating PDF export', {
      scriptId,
      scriptTitle: script.title,
      presetId: preset._id,
      presetName: preset.name,
    });

    // Generate PDF
    const startTime = Date.now();
    const { data, sizeBytes } = await this.pdfGenerator.generatePdf(script, preset, options);
    const duration = Date.now() - startTime;

    this.logger.info('PDF export completed', {
      scriptId,
      scriptTitle: script.title,
      sizeBytes,
      durationMs: duration,
    });

    // Generate filename
    const safeTitle = script.title.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
    const filename = `${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      ok: true as const,
      fileType: 'application/pdf' as const,
      data,
      filename,
      sizeBytes,
    };
  }

  // ============================================================================
  // JSON EXPORT (unchanged)
  // ============================================================================

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

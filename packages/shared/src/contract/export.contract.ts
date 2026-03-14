import { oc } from '@orpc/contract';
import z from 'zod';

import {
  exportPresetSchema,
  createExportPresetInputSchema,
  updateExportPresetInputSchema,
  exportScriptPdfOptionsSchema,
  pageSizeSchema,
  fontFamilySchema,
  blockStyleSchema,
  pageMarginsSchema,
  headerFooterSchema,
} from '../schemas/export-preset.schema';
import { canvasEdgeSchema, canvasNodeSchema } from './canvas.contract';
import {
  characterSchema,
  locationSchema,
  propSchema,
  timelineEntrySchema,
  wildCardSchema,
  appearanceSchema,
} from './knowledge-base.contract';
import { authProcedure } from './procedures';
import { scriptSummarySchema } from './scripts.contract';
import { seriesSchema } from './series.contract';

// Re-export schemas for consumers
export {
  exportPresetSchema,
  createExportPresetInputSchema,
  updateExportPresetInputSchema,
  exportScriptPdfOptionsSchema,
  pageSizeSchema,
  fontFamilySchema,
  blockStyleSchema,
  pageMarginsSchema,
  headerFooterSchema,
};

// ============================================================================
// EXPORT PRESET PROCEDURES
// ============================================================================

const createExportPreset = authProcedure
  .route({
    path: '/presets',
    method: 'POST',
    summary: 'Create export preset',
    description: 'Creates a new PDF export preset with custom styling options.',
  })
  .input(createExportPresetInputSchema)
  .output(exportPresetSchema);

const listExportPresets = authProcedure
  .route({
    path: '/presets',
    method: 'GET',
    summary: 'List export presets',
    description: 'Returns all export presets for the current user, including system defaults.',
  })
  .input(z.object({}).optional())
  .output(z.array(exportPresetSchema));

const getExportPreset = authProcedure
  .route({
    path: '/presets/{presetId}',
    method: 'GET',
    summary: 'Get export preset',
    description: 'Returns a single export preset by ID.',
  })
  .input(z.object({ presetId: z.string() }))
  .output(exportPresetSchema);

const updateExportPreset = authProcedure
  .route({
    path: '/presets/{presetId}',
    method: 'PATCH',
    summary: 'Update export preset',
    description: 'Updates an existing export preset. Cannot modify system presets.',
  })
  .input(updateExportPresetInputSchema)
  .output(exportPresetSchema);

const deleteExportPreset = authProcedure
  .route({
    path: '/presets/{presetId}',
    method: 'DELETE',
    summary: 'Delete export preset',
    description: 'Deletes an export preset. Cannot delete system presets.',
  })
  .input(z.object({ presetId: z.string() }))
  .output(z.object({ success: z.literal(true) }));

const duplicateExportPreset = authProcedure
  .route({
    path: '/presets/{presetId}/duplicate',
    method: 'POST',
    summary: 'Duplicate export preset',
    description: 'Creates a copy of an existing preset (including system presets) for customization.',
  })
  .input(z.object({ presetId: z.string(), name: z.string().optional() }))
  .output(exportPresetSchema);

// ============================================================================
// PDF EXPORT PROCEDURES
// ============================================================================

const exportScriptPdf = authProcedure
  .route({
    path: '/script-pdf',
    method: 'POST',
    summary: 'Export script as PDF',
    description:
      'Exports a screenplay-friendly PDF for a script using the specified preset or defaults. Returns a base64-encoded PDF.',
  })
  .input(exportScriptPdfOptionsSchema)
  .output(
    z.object({
      ok: z.literal(true),
      fileType: z.literal('application/pdf'),
      /** Base64-encoded PDF data */
      data: z.string(),
      /** Suggested filename */
      filename: z.string(),
      /** PDF size in bytes */
      sizeBytes: z.number(),
    }),
  );

// ============================================================================
// JSON EXPORT PROCEDURES
// ============================================================================

const exportSeriesJson = authProcedure
  .route({
    path: '/series-json',
    method: 'GET',
    summary: 'Export series JSON backup',
    description: 'Exports series metadata, scripts summaries, KB entities, canvas, and continuity references as JSON.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(
    z.object({
      series: seriesSchema,
      scripts: z.array(scriptSummarySchema),
      characters: z.array(characterSchema),
      locations: z.array(locationSchema),
      props: z.array(propSchema),
      timeline: z.array(timelineEntrySchema),
      wildcards: z.array(wildCardSchema),
      appearances: z.array(appearanceSchema),
      canvas: z.object({ nodes: z.array(canvasNodeSchema), edges: z.array(canvasEdgeSchema) }),
    }),
  );

// Import input schema (matches export output structure)
const importSeriesJsonInputSchema = z.object({
  /** Target series ID to import into (or 'new' to create a new series) */
  targetSeriesId: z.string(),
  /** Exported data to import */
  data: z.object({
    series: seriesSchema.partial(),
    scripts: z.array(scriptSummarySchema.partial()).optional(),
    characters: z.array(characterSchema.partial()).optional(),
    locations: z.array(locationSchema.partial()).optional(),
    props: z.array(propSchema.partial()).optional(),
    timeline: z.array(timelineEntrySchema.partial()).optional(),
    wildcards: z.array(wildCardSchema.partial()).optional(),
    canvas: z
      .object({
        nodes: z.array(canvasNodeSchema.partial()).optional(),
        edges: z.array(canvasEdgeSchema.partial()).optional(),
      })
      .optional(),
  }),
  /** Import options */
  options: z
    .object({
      /** Skip importing scripts */
      skipScripts: z.boolean().optional(),
      /** Skip importing KB entities */
      skipKnowledgeBase: z.boolean().optional(),
      /** Skip importing canvas */
      skipCanvas: z.boolean().optional(),
      /** Overwrite existing entities with same name */
      overwriteExisting: z.boolean().optional(),
    })
    .optional(),
});

const importSeriesJson = authProcedure
  .route({
    path: '/series-json/import',
    method: 'POST',
    summary: 'Import series JSON backup',
    description: 'Imports series data from a JSON export into an existing series.',
  })
  .input(importSeriesJsonInputSchema)
  .output(
    z.object({
      success: z.literal(true),
      imported: z.object({
        characters: z.number(),
        locations: z.number(),
        props: z.number(),
        timeline: z.number(),
        wildcards: z.number(),
        canvasNodes: z.number(),
        canvasEdges: z.number(),
      }),
      skipped: z.number(),
      errors: z.array(z.string()),
    }),
  );

// ============================================================================
// CONTRACT
// ============================================================================

const exportContract = oc.prefix('/export').router({
  // Preset management
  createExportPreset,
  listExportPresets,
  getExportPreset,
  updateExportPreset,
  deleteExportPreset,
  duplicateExportPreset,
  // Export operations
  exportScriptPdf,
  exportSeriesJson,
  // Import operations
  importSeriesJson,
});

export default exportContract;

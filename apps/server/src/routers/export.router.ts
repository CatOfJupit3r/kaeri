import { featuresBase, featuresProtected } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const exportRouter = featuresBase.export.router({
  // Export Preset Management
  createExportPreset: featuresProtected.export.createExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.createExportPreset(context.session.user.id, input);
  }),

  listExportPresets: featuresProtected.export.listExportPresets.handler(async ({ context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.listExportPresets(context.session.user.id);
  }),

  getExportPreset: featuresProtected.export.getExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.getExportPreset(context.session.user.id, input.presetId);
  }),

  updateExportPreset: featuresProtected.export.updateExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.updateExportPreset(context.session.user.id, input);
  }),

  deleteExportPreset: featuresProtected.export.deleteExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.deleteExportPreset(context.session.user.id, input.presetId);
  }),

  duplicateExportPreset: featuresProtected.export.duplicateExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.duplicateExportPreset(context.session.user.id, input.presetId, input.name);
  }),

  // PDF Export
  exportScriptPdf: featuresProtected.export.exportScriptPdf.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.exportScriptPdf(context.session.user.id, input);
  }),

  // JSON Export
  exportSeriesJson: featuresProtected.export.exportSeriesJson.handler(async ({ input }) => {
    const exportService = GETTERS.ExportService();
    return exportService.exportSeriesJson(input.seriesId);
  }),

  // JSON Import
  importSeriesJson: featuresProtected.export.importSeriesJson.handler(async ({ input }) => {
    const exportService = GETTERS.ExportService();
    return exportService.importSeriesJson(input.targetSeriesId, input.data, input.options ?? {});
  }),
});

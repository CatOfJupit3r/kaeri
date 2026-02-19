import { base, protectedProcedure } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const exportRouter = base.export.router({
  // Export Preset Management
  createExportPreset: protectedProcedure.export.createExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.createExportPreset(context.session.user.id, input);
  }),

  listExportPresets: protectedProcedure.export.listExportPresets.handler(async ({ context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.listExportPresets(context.session.user.id);
  }),

  getExportPreset: protectedProcedure.export.getExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.getExportPreset(context.session.user.id, input.presetId);
  }),

  updateExportPreset: protectedProcedure.export.updateExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.updateExportPreset(context.session.user.id, input);
  }),

  deleteExportPreset: protectedProcedure.export.deleteExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.deleteExportPreset(context.session.user.id, input.presetId);
  }),

  duplicateExportPreset: protectedProcedure.export.duplicateExportPreset.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.duplicateExportPreset(context.session.user.id, input.presetId, input.name);
  }),

  // PDF Export
  exportScriptPdf: protectedProcedure.export.exportScriptPdf.handler(async ({ input, context }) => {
    const exportService = GETTERS.ExportService();
    return exportService.exportScriptPdf(context.session.user.id, input);
  }),

  // JSON Export
  exportSeriesJson: protectedProcedure.export.exportSeriesJson.handler(async ({ input }) => {
    const exportService = GETTERS.ExportService();
    return exportService.exportSeriesJson(input.seriesId);
  }),
});

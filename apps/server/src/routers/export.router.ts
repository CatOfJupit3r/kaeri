import { base, protectedProcedure } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const exportRouter = base.export.router({
  exportScriptPdf: protectedProcedure.export.exportScriptPdf.handler(async ({ input }) => {
    const exportService = GETTERS.ExportService();
    return exportService.exportScriptPdf(input.scriptId);
  }),

  exportSeriesJson: protectedProcedure.export.exportSeriesJson.handler(async ({ input }) => {
    const exportService = GETTERS.ExportService();
    return exportService.exportSeriesJson(input.seriesId);
  }),
});

import { base, protectedProcedure } from '@~/lib/orpc';

// TODO: Implement export service and handlers
export const exportRouter = base.export.router({
  exportScriptPdf: protectedProcedure.export.exportScriptPdf.handler(async () => {
    throw new Error('Not implemented');
  }),

  exportSeriesJson: protectedProcedure.export.exportSeriesJson.handler(async () => {
    throw new Error('Not implemented');
  }),
});

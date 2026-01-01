import { base, protectedProcedure } from '@~/lib/orpc';

// TODO: Implement scripts service and handlers
export const scriptsRouter = base.scripts.router({
  createScript: protectedProcedure.scripts.createScript.handler(async () => {
    throw new Error('Not implemented');
  }),

  updateScript: protectedProcedure.scripts.updateScript.handler(async () => {
    throw new Error('Not implemented');
  }),

  deleteScript: protectedProcedure.scripts.deleteScript.handler(async () => {
    throw new Error('Not implemented');
  }),

  listScriptsBySeries: protectedProcedure.scripts.listScriptsBySeries.handler(async () => {
    throw new Error('Not implemented');
  }),

  getScript: protectedProcedure.scripts.getScript.handler(async () => {
    throw new Error('Not implemented');
  }),

  saveScriptContent: protectedProcedure.scripts.saveScriptContent.handler(async () => {
    throw new Error('Not implemented');
  }),

  exportScriptPdf: protectedProcedure.scripts.exportScriptPdf.handler(async () => {
    throw new Error('Not implemented');
  }),
});

import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const scriptsRouter = base.scripts.router({
  createScript: protectedProcedure.scripts.createScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().create(input),
  ),

  updateScript: protectedProcedure.scripts.updateScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().update(input.scriptId, input.patch),
  ),

  deleteScript: protectedProcedure.scripts.deleteScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().delete(input.scriptId),
  ),

  listScriptsBySeries: protectedProcedure.scripts.listScriptsBySeries.handler(async ({ input }) =>
    GETTERS.ScriptsService().listBySeries(input.seriesId, input.limit, input.offset),
  ),

  getScript: protectedProcedure.scripts.getScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().get(input.scriptId),
  ),

  saveScriptContent: protectedProcedure.scripts.saveScriptContent.handler(async ({ input }) =>
    GETTERS.ScriptsService().saveContent(input.scriptId, input.content, input.cursor),
  ),

  exportScriptPdf: protectedProcedure.scripts.exportScriptPdf.handler(async () => {
    // TODO: Implement PDF export
    throw new Error('PDF export not yet implemented');
  }),
});

import { contentBase, contentProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const scriptsRouter = contentBase.scripts.router({
  createScript: contentProtected.scripts.createScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().create(input),
  ),

  updateScript: contentProtected.scripts.updateScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().update(input.scriptId, input.patch),
  ),

  deleteScript: contentProtected.scripts.deleteScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().delete(input.scriptId),
  ),

  listScriptsBySeries: contentProtected.scripts.listScriptsBySeries.handler(async ({ input }) =>
    GETTERS.ScriptsService().listBySeries(input.seriesId, input.limit, input.offset),
  ),

  getScript: contentProtected.scripts.getScript.handler(async ({ input }) =>
    GETTERS.ScriptsService().get(input.scriptId),
  ),

  saveScriptContent: contentProtected.scripts.saveScriptContent.handler(async ({ input }) =>
    GETTERS.ScriptsService().saveContent(input.scriptId, input.content, input.cursor),
  ),

  exportScriptPdf: contentProtected.scripts.exportScriptPdf.handler(async () => {
    // TODO: Implement PDF export
    throw new Error('PDF export not yet implemented');
  }),
});

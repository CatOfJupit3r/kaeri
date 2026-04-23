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

  // Version management
  listScriptVersions: contentProtected.scripts.listScriptVersions.handler(async ({ input }) =>
    GETTERS.ScriptsService().listVersions(input.scriptId, input.limit, input.offset),
  ),

  getScriptVersion: contentProtected.scripts.getScriptVersion.handler(async ({ input }) =>
    GETTERS.ScriptsService().getVersion(input.scriptId, input.versionId),
  ),

  createScriptVersion: contentProtected.scripts.createScriptVersion.handler(async ({ input, context }) =>
    GETTERS.ScriptsService().createVersion(input.scriptId, context.session.user.id, { name: input.name }),
  ),

  restoreScriptVersion: contentProtected.scripts.restoreScriptVersion.handler(async ({ input, context }) =>
    GETTERS.ScriptsService().restoreVersion(input.scriptId, input.versionId, context.session.user.id),
  ),

  deleteScriptVersion: contentProtected.scripts.deleteScriptVersion.handler(async ({ input }) =>
    GETTERS.ScriptsService().deleteVersion(input.scriptId, input.versionId),
  ),

  updateScriptVersion: contentProtected.scripts.updateScriptVersion.handler(async ({ input }) =>
    GETTERS.ScriptsService().updateVersionName(input.scriptId, input.versionId, input.name),
  ),
});

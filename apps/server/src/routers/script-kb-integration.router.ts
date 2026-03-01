import { base, protectedProcedure } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const scriptKBIntegrationRouter = base.scriptKBIntegration.router({
  /**
   * Fast entity search for inline autocomplete
   *
   * Optimized for <200ms response time with text indexes and caching
   */
  autocompleteSearch: protectedProcedure.scriptKBIntegration.autocompleteSearch.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.autocompleteSearch(input);
  }),

  /**
   * Bulk sync entity appearances from script save
   */
  syncAppearances: protectedProcedure.scriptKBIntegration.syncAppearances.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.syncAppearances(input);
  }),

  /**
   * Quick create entity from script autocomplete
   */
  quickCreateEntity: protectedProcedure.scriptKBIntegration.quickCreateEntity.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.quickCreateEntity(input);
  }),

  /**
   * Ensure Scene entity exists for script scene
   */
  ensureScene: protectedProcedure.scriptKBIntegration.ensureScene.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.ensureScene(input);
  }),

  /**
   * Poll for entity updates (WebSocket-ready)
   */
  pollEntityUpdates: protectedProcedure.scriptKBIntegration.pollEntityUpdates.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.pollEntityUpdates(input);
  }),

  /**
   * Get entity links for a script
   */
  getScriptEntityLinks: protectedProcedure.scriptKBIntegration.getScriptEntityLinks.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.getScriptEntityLinks(input);
  }),

  /**
   * Validate entity links exist
   */
  validateEntityLinks: protectedProcedure.scriptKBIntegration.validateEntityLinks.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.validateEntityLinks(input);
  }),
});

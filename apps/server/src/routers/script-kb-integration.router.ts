import { kbBase, kbProtected } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const scriptKBIntegrationRouter = kbBase.scriptKBIntegration.router({
  /**
   * Fast entity search for inline autocomplete
   *
   * Optimized for <200ms response time with text indexes and caching
   */
  autocompleteSearch: kbProtected.scriptKBIntegration.autocompleteSearch.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.autocompleteSearch(input);
  }),

  /**
   * Bulk sync entity appearances from script save
   */
  syncAppearances: kbProtected.scriptKBIntegration.syncAppearances.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.syncAppearances(input);
  }),

  /**
   * Quick create entity from script autocomplete
   */
  quickCreateEntity: kbProtected.scriptKBIntegration.quickCreateEntity.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.quickCreateEntity(input);
  }),

  /**
   * Ensure Scene entity exists for script scene
   */
  ensureScene: kbProtected.scriptKBIntegration.ensureScene.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.ensureScene(input);
  }),

  /**
   * Poll for entity updates (WebSocket-ready)
   */
  pollEntityUpdates: kbProtected.scriptKBIntegration.pollEntityUpdates.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.pollEntityUpdates(input);
  }),

  /**
   * Get entity links for a script
   */
  getScriptEntityLinks: kbProtected.scriptKBIntegration.getScriptEntityLinks.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.getScriptEntityLinks(input);
  }),

  /**
   * Validate entity links exist
   */
  validateEntityLinks: kbProtected.scriptKBIntegration.validateEntityLinks.handler(async ({ input }) => {
    const service = GETTERS.ScriptKBIntegrationService();
    return service.validateEntityLinks(input);
  }),
});

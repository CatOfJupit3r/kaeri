import { featuresBase, featuresProtected } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const continuityRouter = featuresBase.continuity.router({
  continuityGraph: featuresProtected.continuity.continuityGraph.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.continuityGraph(input.seriesId);
  }),

  appearancesByCharacter: featuresProtected.continuity.appearancesByCharacter.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.appearancesByCharacter(input.seriesId, input.characterId);
  }),

  auditListByEntity: featuresProtected.continuity.auditListByEntity.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.auditListByEntity(
      input.seriesId,
      input.entityType,
      input.entityId,
      input.offset,
      input.limit,
    );
  }),

  auditListBySeries: featuresProtected.continuity.auditListBySeries.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.auditListBySeries(input.seriesId, input.offset, input.limit);
  }),
});

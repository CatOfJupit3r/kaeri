import { base, protectedProcedure } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const continuityRouter = base.continuity.router({
  continuityGraph: protectedProcedure.continuity.continuityGraph.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.continuityGraph(input.seriesId);
  }),

  appearancesByCharacter: protectedProcedure.continuity.appearancesByCharacter.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.appearancesByCharacter(input.seriesId, input.characterId);
  }),

  auditListByEntity: protectedProcedure.continuity.auditListByEntity.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.auditListByEntity(
      input.seriesId,
      input.entityType,
      input.entityId,
      input.offset,
      input.limit,
    );
  }),

  auditListBySeries: protectedProcedure.continuity.auditListBySeries.handler(async ({ input }) => {
    const continuityService = GETTERS.ContinuityService();
    return continuityService.auditListBySeries(input.seriesId, input.offset, input.limit);
  }),
});

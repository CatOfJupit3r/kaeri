import { base, protectedProcedure } from '@~/lib/orpc';

// TODO: Implement continuity service and handlers
export const continuityRouter = base.continuity.router({
  continuityGraph: protectedProcedure.continuity.continuityGraph.handler(async () => {
    throw new Error('Not implemented');
  }),

  appearancesByCharacter: protectedProcedure.continuity.appearancesByCharacter.handler(async () => {
    throw new Error('Not implemented');
  }),

  auditListByEntity: protectedProcedure.continuity.auditListByEntity.handler(async () => {
    throw new Error('Not implemented');
  }),

  auditListBySeries: protectedProcedure.continuity.auditListBySeries.handler(async () => {
    throw new Error('Not implemented');
  }),
});

import { base, protectedProcedure } from '@~/lib/orpc';

// TODO: Implement canvas service and handlers
export const canvasRouter = base.canvas.router({
  getCanvas: protectedProcedure.canvas.getCanvas.handler(async () => {
    throw new Error('Not implemented');
  }),

  upsertNodes: protectedProcedure.canvas.upsertNodes.handler(async () => {
    throw new Error('Not implemented');
  }),

  upsertEdges: protectedProcedure.canvas.upsertEdges.handler(async () => {
    throw new Error('Not implemented');
  }),

  deleteNodes: protectedProcedure.canvas.deleteNodes.handler(async () => {
    throw new Error('Not implemented');
  }),

  deleteEdges: protectedProcedure.canvas.deleteEdges.handler(async () => {
    throw new Error('Not implemented');
  }),
});

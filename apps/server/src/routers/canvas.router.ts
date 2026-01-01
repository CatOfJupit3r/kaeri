import { base, protectedProcedure } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const canvasRouter = base.canvas.router({
  getCanvas: protectedProcedure.canvas.getCanvas.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.getCanvas(input.seriesId);
  }),

  upsertNodes: protectedProcedure.canvas.upsertNodes.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.upsertNodes(input.seriesId, input.nodes);
  }),

  upsertEdges: protectedProcedure.canvas.upsertEdges.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.upsertEdges(input.seriesId, input.edges);
  }),

  deleteNodes: protectedProcedure.canvas.deleteNodes.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.deleteNodes(input.seriesId, input.nodeIds);
  }),

  deleteEdges: protectedProcedure.canvas.deleteEdges.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.deleteEdges(input.seriesId, input.edgeIds);
  }),
});

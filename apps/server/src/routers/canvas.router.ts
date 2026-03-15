import { featuresBase, featuresProtected } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const canvasRouter = featuresBase.canvas.router({
  getCanvas: featuresProtected.canvas.getCanvas.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.getCanvas(input.seriesId);
  }),

  upsertNodes: featuresProtected.canvas.upsertNodes.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.upsertNodes(input.seriesId, input.nodes);
  }),

  upsertEdges: featuresProtected.canvas.upsertEdges.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.upsertEdges(input.seriesId, input.edges);
  }),

  deleteNodes: featuresProtected.canvas.deleteNodes.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.deleteNodes(input.seriesId, input.nodeIds);
  }),

  deleteEdges: featuresProtected.canvas.deleteEdges.handler(async ({ input }) => {
    const canvasService = GETTERS.CanvasService();
    return canvasService.deleteEdges(input.seriesId, input.edgeIds);
  }),
});

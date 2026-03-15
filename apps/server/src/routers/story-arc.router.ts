import { seriesBase, seriesProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const storyArcRouter = seriesBase.storyArc.router({
  createStoryArc: seriesProtected.storyArc.createStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().create(input),
  ),

  updateStoryArc: seriesProtected.storyArc.updateStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().update(input.storyArcId, input.patch),
  ),

  deleteStoryArc: seriesProtected.storyArc.deleteStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().delete(input.storyArcId),
  ),

  listStoryArcs: seriesProtected.storyArc.listStoryArcs.handler(async ({ input }) =>
    GETTERS.StoryArcService().list(input.seriesId, input.status, input.limit, input.offset),
  ),

  getStoryArc: seriesProtected.storyArc.getStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().get(input.storyArcId),
  ),
});

import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const storyArcRouter = base.storyArc.router({
  createStoryArc: protectedProcedure.storyArc.createStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().create(input),
  ),

  updateStoryArc: protectedProcedure.storyArc.updateStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().update(input.storyArcId, input.patch),
  ),

  deleteStoryArc: protectedProcedure.storyArc.deleteStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().delete(input.storyArcId),
  ),

  listStoryArcs: protectedProcedure.storyArc.listStoryArcs.handler(async ({ input }) =>
    GETTERS.StoryArcService().list(input.seriesId, input.status, input.limit, input.offset),
  ),

  getStoryArc: protectedProcedure.storyArc.getStoryArc.handler(async ({ input }) =>
    GETTERS.StoryArcService().get(input.storyArcId),
  ),
});

import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const researchRouter = base.research.router({
  create: protectedProcedure.research.create.handler(async ({ input }) =>
    GETTERS.ResearchService().create(input.seriesId, input.value),
  ),

  update: protectedProcedure.research.update.handler(async ({ input }) =>
    GETTERS.ResearchService().update(input.researchId, input.patch),
  ),

  delete: protectedProcedure.research.delete.handler(async ({ input }) =>
    GETTERS.ResearchService().delete(input.researchId),
  ),

  get: protectedProcedure.research.get.handler(async ({ input }) => GETTERS.ResearchService().get(input.researchId)),

  list: protectedProcedure.research.list.handler(async ({ input }) =>
    GETTERS.ResearchService().list(input.seriesId, input.pagination?.limit ?? 20, input.pagination?.offset ?? 0),
  ),

  search: protectedProcedure.research.search.handler(async ({ input }) =>
    GETTERS.ResearchService().search(
      input.seriesId,
      input.query,
      input.pagination?.limit ?? 20,
      input.pagination?.offset ?? 0,
    ),
  ),
});

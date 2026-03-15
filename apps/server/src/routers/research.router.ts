import { kbBase, kbProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const researchRouter = kbBase.research.router({
  create: kbProtected.research.create.handler(async ({ input }) =>
    GETTERS.ResearchService().create(input.seriesId, input.value),
  ),

  update: kbProtected.research.update.handler(async ({ input }) =>
    GETTERS.ResearchService().update(input.researchId, input.patch),
  ),

  delete: kbProtected.research.delete.handler(async ({ input }) => GETTERS.ResearchService().delete(input.researchId)),

  get: kbProtected.research.get.handler(async ({ input }) => GETTERS.ResearchService().get(input.researchId)),

  list: kbProtected.research.list.handler(async ({ input }) =>
    GETTERS.ResearchService().list(input.seriesId, input.pagination?.limit ?? 20, input.pagination?.offset ?? 0),
  ),

  search: kbProtected.research.search.handler(async ({ input }) =>
    GETTERS.ResearchService().search(
      input.seriesId,
      input.query,
      input.pagination?.limit ?? 20,
      input.pagination?.offset ?? 0,
    ),
  ),
});

import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const episodeRouter = base.episode.router({
  createEpisode: protectedProcedure.episode.createEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().create(input),
  ),

  updateEpisode: protectedProcedure.episode.updateEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().update(input.episodeId, input.patch),
  ),

  deleteEpisode: protectedProcedure.episode.deleteEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().delete(input.episodeId),
  ),

  listEpisodesBySeries: protectedProcedure.episode.listEpisodesBySeries.handler(async ({ input }) =>
    GETTERS.EpisodeService().list(input.seriesId, input.seasonNumber, input.limit, input.offset),
  ),

  getEpisode: protectedProcedure.episode.getEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().get(input.episodeId),
  ),

  linkScript: protectedProcedure.episode.linkScript.handler(async ({ input }) =>
    GETTERS.EpisodeService().linkScript(input.episodeId, input.scriptId),
  ),

  unlinkScript: protectedProcedure.episode.unlinkScript.handler(async ({ input }) =>
    GETTERS.EpisodeService().unlinkScript(input.episodeId, input.scriptId),
  ),
});

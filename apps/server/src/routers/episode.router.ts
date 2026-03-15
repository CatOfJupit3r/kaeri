import { seriesBase, seriesProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const episodeRouter = seriesBase.episode.router({
  createEpisode: seriesProtected.episode.createEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().create(input),
  ),

  updateEpisode: seriesProtected.episode.updateEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().update(input.episodeId, input.patch),
  ),

  deleteEpisode: seriesProtected.episode.deleteEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().delete(input.episodeId),
  ),

  listEpisodesBySeries: seriesProtected.episode.listEpisodesBySeries.handler(async ({ input }) =>
    GETTERS.EpisodeService().list(input.seriesId, input.seasonNumber, input.limit, input.offset),
  ),

  getEpisode: seriesProtected.episode.getEpisode.handler(async ({ input }) =>
    GETTERS.EpisodeService().get(input.episodeId),
  ),

  linkScript: seriesProtected.episode.linkScript.handler(async ({ input }) =>
    GETTERS.EpisodeService().linkScript(input.episodeId, input.scriptId),
  ),

  unlinkScript: seriesProtected.episode.unlinkScript.handler(async ({ input }) =>
    GETTERS.EpisodeService().unlinkScript(input.episodeId, input.scriptId),
  ),
});

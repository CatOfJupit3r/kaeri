import { seriesBase, seriesProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const seriesRouter = seriesBase.series.router({
  createSeries: seriesProtected.series.createSeries.handler(async ({ input }) => GETTERS.SeriesService().create(input)),

  updateSeries: seriesProtected.series.updateSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().update(input.seriesId, input.patch),
  ),

  deleteSeries: seriesProtected.series.deleteSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().delete(input.seriesId),
  ),

  listSeries: seriesProtected.series.listSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().list(input.limit, input.offset),
  ),

  getSeries: seriesProtected.series.getSeries.handler(async ({ input }) => GETTERS.SeriesService().get(input.seriesId)),

  exportSeriesSummary: seriesProtected.series.exportSeriesSummary.handler(async ({ input }) =>
    GETTERS.SeriesService().exportSummary(input.seriesId),
  ),

  getSeriesAnalytics: seriesProtected.series.getSeriesAnalytics.handler(async ({ input }) =>
    GETTERS.SeriesService().getAnalytics(input.seriesId),
  ),
});

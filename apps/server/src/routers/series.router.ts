import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const seriesRouter = base.series.router({
  createSeries: protectedProcedure.series.createSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().create(input),
  ),

  updateSeries: protectedProcedure.series.updateSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().update(input.seriesId, input.patch),
  ),

  deleteSeries: protectedProcedure.series.deleteSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().delete(input.seriesId),
  ),

  listSeries: protectedProcedure.series.listSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().list(input.limit, input.offset),
  ),

  getSeries: protectedProcedure.series.getSeries.handler(async ({ input }) =>
    GETTERS.SeriesService().get(input.seriesId),
  ),

  exportSeriesSummary: protectedProcedure.series.exportSeriesSummary.handler(async ({ input }) =>
    GETTERS.SeriesService().exportSummary(input.seriesId),
  ),
});

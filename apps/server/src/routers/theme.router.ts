import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const themeRouter = base.theme.router({
  createTheme: protectedProcedure.theme.createTheme.handler(async ({ input }) =>
    GETTERS.ThemeService().create(input.seriesId, input.value),
  ),

  updateTheme: protectedProcedure.theme.updateTheme.handler(async ({ input }) =>
    GETTERS.ThemeService().update(input.themeId, input.patch),
  ),

  deleteTheme: protectedProcedure.theme.deleteTheme.handler(async ({ input }) =>
    GETTERS.ThemeService().delete(input.themeId),
  ),

  listThemesBySeries: protectedProcedure.theme.listThemesBySeries.handler(async ({ input }) =>
    GETTERS.ThemeService().list(input.seriesId, input.limit, input.offset),
  ),

  getTheme: protectedProcedure.theme.getTheme.handler(async ({ input }) => GETTERS.ThemeService().get(input.themeId)),
});

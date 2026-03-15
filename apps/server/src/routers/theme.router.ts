import { featuresBase, featuresProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const themeRouter = featuresBase.theme.router({
  createTheme: featuresProtected.theme.createTheme.handler(async ({ input }) =>
    GETTERS.ThemeService().create(input.seriesId, input.value),
  ),

  updateTheme: featuresProtected.theme.updateTheme.handler(async ({ input }) =>
    GETTERS.ThemeService().update(input.themeId, input.patch),
  ),

  deleteTheme: featuresProtected.theme.deleteTheme.handler(async ({ input }) =>
    GETTERS.ThemeService().delete(input.themeId),
  ),

  listThemesBySeries: featuresProtected.theme.listThemesBySeries.handler(async ({ input }) =>
    GETTERS.ThemeService().list(input.seriesId, input.limit, input.offset),
  ),

  getTheme: featuresProtected.theme.getTheme.handler(async ({ input }) => GETTERS.ThemeService().get(input.themeId)),
});

import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ThemeListQueryReturnType = ORPCOutputs['theme']['listThemesBySeries'];
export type ThemeListItem = ThemeListQueryReturnType['items'][number];

export const themeListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.theme.listThemesBySeries.queryOptions({
    input: {
      seriesId,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });

export function useThemeList(seriesId: string, limit = 20, offset = 0, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...themeListQueryOptions(seriesId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

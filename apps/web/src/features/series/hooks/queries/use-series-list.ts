import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type SeriesListQueryReturnType = ORPCOutputs['series']['listSeries'];

export const seriesListQueryOptions = (params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.series.listSeries.queryOptions({
    input: { limit: params.limit ?? 20, offset: params.offset ?? 0 },
  });

export function useSeriesList(limit = 20, offset = 0, params: { enabled?: boolean } = {}) {
  return useQuery({ ...seriesListQueryOptions({ limit, offset }), enabled: params.enabled ?? true });
}

import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type SeriesQueryReturnType = ORPCOutputs['series']['getSeries'];

export const seriesQueryOptions = (seriesId: string) =>
  tanstackRPC.series.getSeries.queryOptions({
    input: { seriesId },
  });

export function useSeries(seriesId: string | undefined, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...seriesQueryOptions(seriesId ?? ''),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type LocationListQueryReturnType = ORPCOutputs['knowledgeBase']['locations']['list'];

export const locationListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.knowledgeBase.locations.list.queryOptions({
    input: { seriesId, limit: params.limit ?? 20, offset: params.offset ?? 0 },
  });

export function useLocationList(seriesId: string, limit = 20, offset = 0, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...locationListQueryOptions(seriesId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

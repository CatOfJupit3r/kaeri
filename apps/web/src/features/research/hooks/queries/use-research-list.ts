import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ResearchListQueryReturnType = ORPCOutputs['research']['list'];
export type ResearchListItem = ResearchListQueryReturnType['items'][number];

export const researchListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.research.list.queryOptions({
    input: {
      seriesId,
      pagination: {
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    },
  });

export function useResearchList(seriesId: string, limit = 20, offset = 0, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...researchListQueryOptions(seriesId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

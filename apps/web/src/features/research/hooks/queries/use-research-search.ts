import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ResearchSearchQueryReturnType = ORPCOutputs['research']['search'];

export const researchSearchQueryOptions = (
  seriesId: string,
  query: string,
  params: { limit?: number; offset?: number } = {},
) =>
  tanstackRPC.research.search.queryOptions({
    input: {
      seriesId,
      query,
      pagination: {
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    },
  });

export function useResearchSearch(
  seriesId: string,
  query: string,
  limit = 20,
  offset = 0,
  params: { enabled?: boolean } = {},
) {
  return useQuery({
    ...researchSearchQueryOptions(seriesId, query, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId && query.length > 0,
  });
}

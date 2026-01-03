import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type KBSearchQueryReturnType = ORPCOutputs['knowledgeBase']['searchKB'];

export const kbSearchQueryOptions = (
  seriesId: string,
  query: string,
  params: { limit?: number; offset?: number } = {},
) =>
  tanstackRPC.knowledgeBase.searchKB.queryOptions({
    input: { seriesId, query, limit: params.limit ?? 20, offset: params.offset ?? 0 },
  });

export function useKBSearch(
  seriesId: string,
  query: string,
  limit = 20,
  offset = 0,
  params: { enabled?: boolean } = {},
) {
  const isEnabled = (params.enabled ?? true) && !!seriesId && query.trim().length > 0;

  return useQuery({
    ...kbSearchQueryOptions(seriesId, query, { limit, offset }),
    enabled: isEnabled,
  });
}

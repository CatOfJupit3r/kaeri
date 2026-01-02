import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export function useKBSearch(seriesId: string, query: string, limit = 20, offset = 0) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.searchKB.queryOptions({
      input: { seriesId, query, limit, offset },
    }),
    enabled: !!seriesId && query.trim().length > 0,
  });
}

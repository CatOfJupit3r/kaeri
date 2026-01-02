import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export function useLocationList(seriesId: string, limit = 20, offset = 0) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.locations.list.queryOptions({
      input: { seriesId, limit, offset },
    }),
    enabled: !!seriesId,
  });
}

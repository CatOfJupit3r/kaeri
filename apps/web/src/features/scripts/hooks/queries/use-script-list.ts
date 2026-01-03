import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export function useScriptList(seriesId: string, limit = 100, offset = 0) {
  return useQuery({
    ...tanstackRPC.scripts.listScriptsBySeries.queryOptions({
      input: { seriesId, limit, offset },
    }),
    enabled: !!seriesId,
  });
}

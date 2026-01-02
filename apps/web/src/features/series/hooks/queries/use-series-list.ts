import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export function useSeriesList(limit = 20, offset = 0) {
  return useQuery(
    tanstackRPC.series.listSeries.queryOptions({
      input: { limit, offset },
    }),
  );
}

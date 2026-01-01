import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export function useSeries(seriesId: string | undefined) {
  return useQuery({
    ...tanstackRPC.series.getSeries.queryOptions({
      input: { seriesId: seriesId ?? '' },
    }),
    enabled: !!seriesId,
  });
}

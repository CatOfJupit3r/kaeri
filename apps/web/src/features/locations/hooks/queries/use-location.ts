import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type LocationQueryReturnType = ORPCOutputs['knowledgeBase']['locations']['get'];

export function useLocation(locationId: string, seriesId: string) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.locations.get.queryOptions({
      input: { id: locationId, seriesId },
    }),
    enabled: !!locationId && !!seriesId,
  });
}

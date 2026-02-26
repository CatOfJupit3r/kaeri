import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type PropQueryReturnType = ORPCOutputs['knowledgeBase']['props']['get'];

export function useProp(propId: string, seriesId: string) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.props.get.queryOptions({
      input: { id: propId, seriesId },
    }),
    enabled: !!propId && !!seriesId,
  });
}

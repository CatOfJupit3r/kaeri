import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type WildcardQueryReturnType = ORPCOutputs['knowledgeBase']['wildcards']['get'];

export function useWildcard(wildcardId: string, seriesId: string) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.wildcards.get.queryOptions({
      input: { id: wildcardId, seriesId },
    }),
    enabled: !!wildcardId && !!seriesId,
  });
}

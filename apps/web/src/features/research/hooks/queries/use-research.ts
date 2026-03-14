import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ResearchQueryReturnType = ORPCOutputs['research']['get'];

export const researchQueryOptions = (researchId: string) =>
  tanstackRPC.research.get.queryOptions({
    input: { researchId },
  });

export function useResearch(researchId: string, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...researchQueryOptions(researchId),
    enabled: (params.enabled ?? true) && !!researchId,
  });
}

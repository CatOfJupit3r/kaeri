import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ContinuityGraphOutput = ORPCOutputs['continuity']['continuityGraph'];
export type ContinuityNode = ContinuityGraphOutput['nodes'][number];
export type ContinuityEdge = ContinuityGraphOutput['edges'][number];

export const continuityGraphQueryOptions = (seriesId: string) =>
  tanstackRPC.continuity.continuityGraph.queryOptions({
    input: { seriesId },
  });

export function useContinuityGraph(seriesId: string, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...continuityGraphQueryOptions(seriesId),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

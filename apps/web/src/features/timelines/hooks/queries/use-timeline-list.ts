import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type TimelineListQueryReturnType = ORPCOutputs['knowledgeBase']['timeline']['list'];

export const timelineListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.knowledgeBase.timeline.list.queryOptions({
    input: { seriesId, limit: params.limit ?? 20, offset: params.offset ?? 0 },
  });

export function useTimelineList(seriesId: string, limit = 20, offset = 0, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...timelineListQueryOptions(seriesId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

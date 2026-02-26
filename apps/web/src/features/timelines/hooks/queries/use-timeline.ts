import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type TimelineQueryReturnType = ORPCOutputs['knowledgeBase']['timeline']['get'];

export function useTimeline(timelineId: string, seriesId: string) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.timeline.get.queryOptions({
      input: { id: timelineId, seriesId },
    }),
    enabled: !!timelineId && !!seriesId,
  });
}

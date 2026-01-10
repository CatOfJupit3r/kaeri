import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type StoryArcDetailQueryReturnType = ORPCOutputs['storyArc']['getStoryArc'];

export const storyArcDetailQueryOptions = (storyArcId: string) =>
  tanstackRPC.storyArc.getStoryArc.queryOptions({
    input: { storyArcId },
  });

export function useStoryArc(storyArcId: string, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...storyArcDetailQueryOptions(storyArcId),
    enabled: (params.enabled ?? true) && !!storyArcId,
  });
}

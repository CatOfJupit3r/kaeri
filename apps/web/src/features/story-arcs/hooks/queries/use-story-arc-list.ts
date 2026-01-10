import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type StoryArcListQueryReturnType = ORPCOutputs['storyArc']['listStoryArcs'];
export type StoryArcListItem = StoryArcListQueryReturnType['items'][number];

export const storyArcListQueryOptions = (
  seriesId: string,
  params: { limit?: number; offset?: number; status?: 'planned' | 'in_progress' | 'completed' | 'abandoned' } = {},
) =>
  tanstackRPC.storyArc.listStoryArcs.queryOptions({
    input: {
      seriesId,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      ...(params.status ? { status: params.status } : {}),
    },
  });

export function useStoryArcList(
  seriesId: string,
  params: { limit?: number; offset?: number; status?: 'planned' | 'in_progress' | 'completed' | 'abandoned' } = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    ...storyArcListQueryOptions(seriesId, params),
    enabled: (options.enabled ?? true) && !!seriesId,
  });
}

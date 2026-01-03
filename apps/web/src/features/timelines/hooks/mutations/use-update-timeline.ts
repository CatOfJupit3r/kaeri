import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

type TimelineListReturnType = ORPCOutputs['knowledgeBase']['timeline']['list'];

export const updateTimelineMutationOptions = tanstackRPC.knowledgeBase.timeline.update.mutationOptions({
  onMutate: async ({ id, seriesId, patch }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<TimelineListReturnType>(queryKey);

    ctx.client.setQueryData<TimelineListReturnType>(queryKey, (old) => {
      if (!old) return old;

      return {
        ...old,
        items: old.items.map((entry) =>
          entry._id === id
            ? {
                ...entry,
                ...patch,
              }
            : entry,
        ),
      };
    });

    return { previous };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });
    void ctx.client.invalidateQueries({ queryKey });
    toastORPCError('Failed to update timeline entry', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void invalidateKnowledgeBaseLists(ctx.client, 'timeline', seriesId);
    toastSuccess('Timeline entry updated successfully');
  },
});

export function useUpdateTimeline() {
  const { mutate: updateTimeline, isPending } = useMutation(updateTimelineMutationOptions);

  return {
    updateTimeline,
    isPending,
  };
}

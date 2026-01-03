import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

type TimelineListReturnType = ORPCOutputs['knowledgeBase']['timeline']['list'];

export const deleteTimelineMutationOptions = tanstackRPC.knowledgeBase.timeline.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<TimelineListReturnType>(queryKey);

    ctx.client.setQueryData<TimelineListReturnType>(queryKey, (old) => {
      if (!old) return old;

      const filteredItems = old.items.filter((entry) => entry._id !== id);
      const isRemoved = filteredItems.length !== old.items.length;

      return {
        ...old,
        items: filteredItems,
        total: isRemoved ? Math.max(0, old.total - 1) : old.total,
      };
    });

    return { previous };
  },
  onError: (error, { seriesId }, context, ctx) => {
    if (context?.previous) {
      const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({
        input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
      });
      void ctx.client.invalidateQueries({ queryKey });
    }
    toastORPCError('Failed to delete timeline entry', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void invalidateKnowledgeBaseLists(ctx.client, 'timeline', seriesId);
    toastSuccess('Timeline entry deleted successfully');
  },
});

export function useDeleteTimeline() {
  const { mutate: deleteTimeline, isPending } = useMutation(deleteTimelineMutationOptions);

  return {
    deleteTimeline,
    isPending,
  };
}

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

type TimelineListReturnType = ORPCOutputs['knowledgeBase']['timeline']['list'];

export const deleteTimelineMutationOptions = tanstackRPC.knowledgeBase.timeline.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<TimelineListReturnType>(queryKey);

    ctx.client.setQueryData<TimelineListReturnType>(queryKey, (old) => {
      if (!old) return old;

      return {
        ...old,
        items: old.items.filter((entry) => entry._id !== id),
        total: old.total - 1,
      };
    });

    return { previous };
  },
  onError: (error, { seriesId }, context, ctx) => {
    if (context?.previous) {
      const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });
      ctx.client.setQueryData<TimelineListReturnType>(queryKey, context.previous);
    }
    toastORPCError('Failed to delete timeline entry', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.timeline.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });
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

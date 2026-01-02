import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createTimelineMutationOptions = tanstackRPC.knowledgeBase.timeline.create.mutationOptions({
  onMutate: async ({ seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.timeline.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });
    toastSuccess('Timeline entry created successfully');
  },
  onError: (error) => {
    toastORPCError('Failed to create timeline entry', error);
  },
});

export function useCreateTimeline() {
  const { mutate: createTimeline, isPending } = useMutation(createTimelineMutationOptions);

  return {
    createTimeline,
    isPending,
  };
}

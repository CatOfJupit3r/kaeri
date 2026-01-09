import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { StoryArcListQueryReturnType } from '../queries/use-story-arc-list';

export const updateStoryArcMutationOptions = tanstackRPC.storyArc.updateStoryArc.mutationOptions({
  onMutate: async ({ storyArcId }, ctx) => {
    const detailQueryKey = tanstackRPC.storyArc.getStoryArc.queryKey({ input: { storyArcId } });
    await ctx.client.cancelQueries({ queryKey: detailQueryKey });

    void ctx.client.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'storyArc' && query.queryKey[1] === 'listStoryArcs',
    });
  },
  onSuccess: (updatedStoryArc, _variables, _context, ctx) => {
    const detailQueryKey = tanstackRPC.storyArc.getStoryArc.queryKey({ input: { storyArcId: updatedStoryArc._id } });
    ctx.client.setQueryData(detailQueryKey, updatedStoryArc);

    const listQueryKeys = ctx.client
      .getQueryCache()
      .findAll({ predicate: (query) => query.queryKey[0] === 'storyArc' && query.queryKey[1] === 'listStoryArcs' });

    listQueryKeys.forEach((query) => {
      const oldData = query.state.data as StoryArcListQueryReturnType | undefined;
      if (!oldData) return;

      ctx.client.setQueryData<StoryArcListQueryReturnType>(query.queryKey, {
        ...oldData,
        items: oldData.items.map((arc) => (arc._id === updatedStoryArc._id ? updatedStoryArc : arc)),
      });
    });

    toastSuccess('Story arc updated successfully');
  },
  onError: (error, { storyArcId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.storyArc.getStoryArc.queryKey({ input: { storyArcId } }),
    });
    void ctx.client.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'storyArc' && query.queryKey[1] === 'listStoryArcs',
    });
    toastORPCError('Failed to update story arc', error);
  },
});

export function useUpdateStoryArc() {
  const { mutate: updateStoryArc, isPending } = useMutation(updateStoryArcMutationOptions);

  return {
    updateStoryArc,
    isPending,
  };
}

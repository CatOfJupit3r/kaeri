import { useMutation } from '@tanstack/react-query';

import { toastORPCError } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { StoryArcListQueryReturnType } from '../queries/use-story-arc-list';

function isStoryArcListQuery(queryKey: readonly unknown[]) {
  const serializedQueryKey = JSON.stringify(queryKey);

  return serializedQueryKey.includes('"storyArc"') && serializedQueryKey.includes('"listStoryArcs"');
}

export const updateStoryArcMutationOptions = tanstackRPC.storyArc.updateStoryArc.mutationOptions({
  onMutate: async ({ storyArcId }, ctx) => {
    const detailQueryKey = tanstackRPC.storyArc.getStoryArc.queryKey({ input: { storyArcId } });
    await ctx.client.cancelQueries({ queryKey: detailQueryKey });

    void ctx.client.invalidateQueries({
      predicate: (query) => isStoryArcListQuery(query.queryKey),
    });
  },
  onSuccess: (updatedStoryArc, _variables, _context, ctx) => {
    const detailQueryKey = tanstackRPC.storyArc.getStoryArc.queryKey({ input: { storyArcId: updatedStoryArc._id } });
    ctx.client.setQueryData(detailQueryKey, updatedStoryArc);

    const listQueryKeys = ctx.client.getQueryCache().findAll({
      predicate: (query) => isStoryArcListQuery(query.queryKey),
    });

    listQueryKeys.forEach((query) => {
      const oldData = query.state.data as StoryArcListQueryReturnType | undefined;
      if (!oldData) return;

      ctx.client.setQueryData<StoryArcListQueryReturnType>(query.queryKey, {
        ...oldData,
        items: oldData.items.map((arc) => (arc._id === updatedStoryArc._id ? updatedStoryArc : arc)),
      });
    });
  },
  onError: (error, { storyArcId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.storyArc.getStoryArc.queryKey({ input: { storyArcId } }),
    });
    void ctx.client.invalidateQueries({
      predicate: (query) => isStoryArcListQuery(query.queryKey),
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

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { StoryArcListQueryReturnType } from '../queries/use-story-arc-list';

export const deleteStoryArcMutationOptions = tanstackRPC.storyArc.deleteStoryArc.mutationOptions({
  onMutate: async ({ storyArcId }, ctx) => {
    const listQueryKeys = ctx.client
      .getQueryCache()
      .findAll({ predicate: (query) => query.queryKey[0] === 'storyArc' && query.queryKey[1] === 'listStoryArcs' });

    const previousData: Array<{ queryKey: readonly unknown[]; data: StoryArcListQueryReturnType | undefined }> = [];

    listQueryKeys.forEach((query) => {
      const oldData = query.state.data as StoryArcListQueryReturnType | undefined;
      previousData.push({ queryKey: query.queryKey, data: oldData });

      if (oldData) {
        ctx.client.setQueryData<StoryArcListQueryReturnType>(query.queryKey, {
          ...oldData,
          items: oldData.items.filter((arc) => arc._id !== storyArcId),
          total: oldData.total - 1,
        });
      }
    });

    return { previousData };
  },
  onSuccess: (_data, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'storyArc' && query.queryKey[1] === 'listStoryArcs',
    });
    toastSuccess('Story arc deleted successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.previousData) {
      context.previousData.forEach(({ queryKey, data }) => {
        if (data) {
          ctx.client.setQueryData<StoryArcListQueryReturnType>(queryKey, data);
        }
      });
    }

    void ctx.client.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'storyArc' && query.queryKey[1] === 'listStoryArcs',
    });
    toastORPCError('Failed to delete story arc', error);
  },
});

export function useDeleteStoryArc() {
  const { mutate: deleteStoryArc, isPending } = useMutation(deleteStoryArcMutationOptions);

  return {
    deleteStoryArc,
    isPending,
  };
}

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { StoryArcListQueryReturnType, StoryArcListItem } from '../queries/use-story-arc-list';

export const createStoryArcMutationOptions = tanstackRPC.storyArc.createStoryArc.mutationOptions({
  onMutate: async (input, ctx) => {
    const queryKey = tanstackRPC.storyArc.listStoryArcs.queryKey({
      input: { seriesId: input.seriesId, limit: 20, offset: 0 },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<StoryArcListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticStoryArc: StoryArcListItem = {
      _id: tempId,
      seriesId: input.seriesId,
      name: input.name,
      description: input.description ?? '',
      status: input.status ?? 'planned',
      startScriptId: input.startScriptId,
      endScriptId: input.endScriptId,
      keyBeats: input.keyBeats ?? [],
      resolution: input.resolution,
      characters: input.characters ?? [],
      themeIds: input.themeIds ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    ctx.client.setQueryData<StoryArcListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticStoryArc],
          total: 1,
        } satisfies StoryArcListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticStoryArc, ...old.items],
        total: old.total + 1,
      } satisfies StoryArcListQueryReturnType;
    });

    return { previous, tempId, queryKey };
  },
  onSuccess: (createdStoryArc, _input, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<StoryArcListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [createdStoryArc, ...withoutTemp],
        } satisfies StoryArcListQueryReturnType;
      });
    }

    void ctx.client.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'storyArc' && query.queryKey[1] === 'listStoryArcs',
    });
    toastSuccess('Story arc created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
    toastORPCError('Failed to create story arc', error);
  },
});

export function useCreateStoryArc() {
  const { mutate: createStoryArc, isPending } = useMutation(createStoryArcMutationOptions);

  return {
    createStoryArc,
    isPending,
  };
}

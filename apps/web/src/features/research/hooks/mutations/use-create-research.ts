import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ResearchListItem, ResearchListQueryReturnType } from '../queries/use-research-list';

export const createResearchMutationOptions = tanstackRPC.research.create.mutationOptions({
  onMutate: async ({ seriesId, value }, ctx) => {
    const queryKey = tanstackRPC.research.list.queryKey({
      input: { seriesId, pagination: { limit: 20, offset: 0 } },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<ResearchListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticResearch: ResearchListItem = {
      _id: tempId,
      seriesId,
      title: value.title,
      content: value.content ?? '',
      tags: value.tags ?? [],
      entityLinks: value.entityLinks ?? [],
    };

    ctx.client.setQueryData<ResearchListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticResearch],
          total: 1,
          hasMore: false,
        } satisfies ResearchListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticResearch, ...old.items],
        total: old.total + 1,
      } satisfies ResearchListQueryReturnType;
    });

    return { previous, queryKey, tempId };
  },

  onSuccess: (result, _variables, context, ctx) => {
    // Replace temp item with real data
    if (context?.queryKey) {
      ctx.client.setQueryData<ResearchListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => (item._id === context.tempId ? result : item)),
        };
      });
    }
    toastSuccess('Research entry created');
  },

  onError: (error, _variables, context, ctx) => {
    // Rollback on error
    if (context?.previous && context?.queryKey) {
      ctx.client.setQueryData(context.queryKey, context.previous);
    }
    toastORPCError('Failed to create research entry', error);
  },
});

export function useCreateResearch() {
  return useMutation(createResearchMutationOptions);
}

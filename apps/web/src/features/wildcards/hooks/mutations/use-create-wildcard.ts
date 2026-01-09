import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';
import type { WildcardListQueryReturnType } from '../queries/use-wildcard-list';

type WildcardListItem = WildcardListQueryReturnType['items'][number];

export const createWildcardMutationOptions = tanstackRPC.knowledgeBase.wildcards.create.mutationOptions({
  onMutate: async ({ seriesId, value }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<WildcardListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticWildcard: WildcardListItem = {
      _id: tempId,
      seriesId,
      title: value.title,
      body: value.body,
      tag: value.tag,
    };

    ctx.client.setQueryData<WildcardListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticWildcard],
          total: 1,
        } satisfies WildcardListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticWildcard, ...old.items],
        total: old.total + 1,
      } satisfies WildcardListQueryReturnType;
    });

    return { previous, tempId, queryKey };
  },
  onSuccess: (createdWildcard, { seriesId }, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<WildcardListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [createdWildcard, ...withoutTemp],
        } satisfies WildcardListQueryReturnType;
      });
    }

    void invalidateKnowledgeBaseLists(ctx.client, 'wildcards', seriesId);
    toastSuccess('Wild Card created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
    toastORPCError('Failed to create Wild Card', error);
  },
});

export function useCreateWildcard() {
  const { mutate: createWildcard, isPending } = useMutation(createWildcardMutationOptions);

  return {
    createWildcard,
    isPending,
  };
}

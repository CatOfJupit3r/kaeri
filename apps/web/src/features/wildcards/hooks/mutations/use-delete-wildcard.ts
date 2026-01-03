import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

export type WildcardListQueryReturnType = ORPCOutputs['knowledgeBase']['wildcards']['list'];

export const deleteWildcardMutationOptions = tanstackRPC.knowledgeBase.wildcards.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<WildcardListQueryReturnType>(queryKey);

    ctx.client.setQueryData<WildcardListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const filteredItems = oldData.items.filter((wildcard) => wildcard._id !== id);
      const isRemoved = filteredItems.length !== oldData.items.length;

      return {
        ...oldData,
        items: filteredItems,
        total: isRemoved ? Math.max(0, oldData.total - 1) : oldData.total,
      };
    });

    return { previousData };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    void ctx.client.invalidateQueries({ queryKey });

    toastORPCError('Failed to delete Wild Card', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void invalidateKnowledgeBaseLists(ctx.client, 'wildcards', seriesId);

    toastSuccess('Wild Card deleted successfully');
  },
});

export function useDeleteWildcard() {
  const { mutate: deleteWildcard, isPending } = useMutation(deleteWildcardMutationOptions);

  return {
    deleteWildcard,
    isPending,
  };
}

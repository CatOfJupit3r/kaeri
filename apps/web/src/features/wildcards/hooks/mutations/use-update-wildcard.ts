import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

export type WildcardListQueryReturnType = ORPCOutputs['knowledgeBase']['wildcards']['list'];

export const updateWildcardMutationOptions = tanstackRPC.knowledgeBase.wildcards.update.mutationOptions({
  onMutate: async ({ id, seriesId, patch }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<WildcardListQueryReturnType>(queryKey);

    ctx.client.setQueryData<WildcardListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((wildcard) => (wildcard._id === id ? { ...wildcard, ...patch } : wildcard)),
      };
    });

    return { previousData };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    void ctx.client.invalidateQueries({ queryKey });

    toastORPCError('Failed to update Wild Card', error);
  },
  onSuccess: (updatedWildcard, { seriesId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    ctx.client.setQueryData<WildcardListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((wildcard) => (wildcard._id === updatedWildcard._id ? updatedWildcard : wildcard)),
      };
    });

    void invalidateKnowledgeBaseLists(ctx.client, 'wildcards', seriesId);

    toastSuccess('Wild Card updated successfully');
  },
});

export function useUpdateWildcard() {
  const { mutate: updateWildcard, isPending } = useMutation(updateWildcardMutationOptions);

  return {
    updateWildcard,
    isPending,
  };
}

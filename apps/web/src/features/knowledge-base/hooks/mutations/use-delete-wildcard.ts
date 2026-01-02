import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type WildcardListQueryReturnType = ORPCOutputs['knowledgeBase']['wildcards']['list'];

export const deleteWildcardMutationOptions = tanstackRPC.knowledgeBase.wildcards.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<WildcardListQueryReturnType>(queryKey);

    ctx.client.setQueryData<WildcardListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.filter((wildcard) => wildcard._id !== id),
        total: oldData.total - 1,
      };
    });

    return { previousData };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    if (context?.previousData) {
      ctx.client.setQueryData<WildcardListQueryReturnType>(queryKey, context.previousData);
    } else {
      void ctx.client.invalidateQueries({ queryKey });
    }

    toastORPCError('Failed to delete Wild Card', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.wildcards.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });

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

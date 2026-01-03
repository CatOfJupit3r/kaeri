import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

export type PropListQueryReturnType = ORPCOutputs['knowledgeBase']['props']['list'];

export const deletePropMutationOptions = tanstackRPC.knowledgeBase.props.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<PropListQueryReturnType>(queryKey);

    ctx.client.setQueryData<PropListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const filteredItems = oldData.items.filter((prop) => prop._id !== id);
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
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    void ctx.client.invalidateQueries({ queryKey });

    toastORPCError('Failed to delete prop', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void invalidateKnowledgeBaseLists(ctx.client, 'props', seriesId);

    toastSuccess('Prop deleted successfully');
  },
});

export function useDeleteProp() {
  const { mutate: deleteProp, isPending } = useMutation(deletePropMutationOptions);

  return {
    deleteProp,
    isPending,
  };
}

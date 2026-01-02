import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type PropListQueryReturnType = ORPCOutputs['knowledgeBase']['props']['list'];

export const deletePropMutationOptions = tanstackRPC.knowledgeBase.props.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<PropListQueryReturnType>(queryKey);

    ctx.client.setQueryData<PropListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.filter((prop) => prop._id !== id),
        total: oldData.total - 1,
      };
    });

    return { previousData };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    if (context?.previousData) {
      ctx.client.setQueryData<PropListQueryReturnType>(queryKey, context.previousData);
    } else {
      void ctx.client.invalidateQueries({ queryKey });
    }

    toastORPCError('Failed to delete prop', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });

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

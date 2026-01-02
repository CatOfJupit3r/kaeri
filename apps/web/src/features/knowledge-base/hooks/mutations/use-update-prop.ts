import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type PropListQueryReturnType = ORPCOutputs['knowledgeBase']['props']['list'];

export const updatePropMutationOptions = tanstackRPC.knowledgeBase.props.update.mutationOptions({
  onMutate: async ({ id, seriesId, patch }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<PropListQueryReturnType>(queryKey);

    ctx.client.setQueryData<PropListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((prop) => (prop._id === id ? { ...prop, ...patch } : prop)),
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

    toastORPCError('Failed to update prop', error);
  },
  onSuccess: (updatedProp, { seriesId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    ctx.client.setQueryData<PropListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((prop) => (prop._id === updatedProp._id ? updatedProp : prop)),
      };
    });

    toastSuccess('Prop updated successfully');
  },
});

export function useUpdateProp() {
  const { mutate: updateProp, isPending } = useMutation(updatePropMutationOptions);

  return {
    updateProp,
    isPending,
  };
}

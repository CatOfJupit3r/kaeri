import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type LocationListQueryReturnType = ORPCOutputs['knowledgeBase']['locations']['list'];

export const deleteLocationMutationOptions = tanstackRPC.knowledgeBase.locations.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<LocationListQueryReturnType>(queryKey);

    ctx.client.setQueryData<LocationListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.filter((location) => location._id !== id),
        total: oldData.total - 1,
      };
    });

    return { previousData };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    if (context?.previousData) {
      ctx.client.setQueryData<LocationListQueryReturnType>(queryKey, context.previousData);
    } else {
      void ctx.client.invalidateQueries({ queryKey });
    }

    toastORPCError('Failed to delete location', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });

    toastSuccess('Location deleted successfully');
  },
});

export function useDeleteLocation() {
  const { mutate: deleteLocation, isPending } = useMutation(deleteLocationMutationOptions);

  return {
    deleteLocation,
    isPending,
  };
}

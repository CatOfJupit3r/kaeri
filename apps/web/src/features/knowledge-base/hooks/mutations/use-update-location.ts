import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type LocationListQueryReturnType = ORPCOutputs['knowledgeBase']['locations']['list'];

export const updateLocationMutationOptions = tanstackRPC.knowledgeBase.locations.update.mutationOptions({
  onMutate: async ({ id, seriesId, patch }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<LocationListQueryReturnType>(queryKey);

    ctx.client.setQueryData<LocationListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((location) => (location._id === id ? { ...location, ...patch } : location)),
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

    toastORPCError('Failed to update location', error);
  },
  onSuccess: (updatedLocation, { seriesId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    ctx.client.setQueryData<LocationListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((location) => (location._id === updatedLocation._id ? updatedLocation : location)),
      };
    });

    toastSuccess('Location updated successfully');
  },
});

export function useUpdateLocation() {
  const { mutate: updateLocation, isPending } = useMutation(updateLocationMutationOptions);

  return {
    updateLocation,
    isPending,
  };
}

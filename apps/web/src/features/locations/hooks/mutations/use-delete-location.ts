import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

export type LocationListQueryReturnType = ORPCOutputs['knowledgeBase']['locations']['list'];

export const deleteLocationMutationOptions = tanstackRPC.knowledgeBase.locations.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<LocationListQueryReturnType>(queryKey);

    ctx.client.setQueryData<LocationListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const filteredItems = oldData.items.filter((location) => location._id !== id);
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
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    void ctx.client.invalidateQueries({ queryKey });

    toastORPCError('Failed to delete location', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void invalidateKnowledgeBaseLists(ctx.client, 'locations', seriesId);

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

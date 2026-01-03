import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';
import type { LocationListQueryReturnType } from '../queries/use-location-list';

type LocationListItem = LocationListQueryReturnType['items'][number];

export const createLocationMutationOptions = tanstackRPC.knowledgeBase.locations.create.mutationOptions({
  onMutate: async ({ seriesId, value }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<LocationListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticLocation: LocationListItem = {
      _id: tempId,
      seriesId,
      name: value.name as LocationListItem['name'],
      description: value.description as LocationListItem['description'],
      tags: (value.tags ?? []) as LocationListItem['tags'],
      appearances: (value.appearances ?? []) as LocationListItem['appearances'],
    };

    ctx.client.setQueryData<LocationListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticLocation],
          total: 1,
        } satisfies LocationListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticLocation, ...old.items],
        total: old.total + 1,
      } satisfies LocationListQueryReturnType;
    });

    return { previous, queryKey, tempId };
  },
  onSuccess: (createdLocation, { seriesId }, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<LocationListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [createdLocation, ...withoutTemp],
        } satisfies LocationListQueryReturnType;
      });
    }

    void invalidateKnowledgeBaseLists(ctx.client, 'locations', seriesId);
    toastSuccess('Location created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
    toastORPCError('Failed to create location', error);
  },
});

export function useCreateLocation() {
  const { mutate: createLocation, isPending } = useMutation(createLocationMutationOptions);

  return {
    createLocation,
    isPending,
  };
}

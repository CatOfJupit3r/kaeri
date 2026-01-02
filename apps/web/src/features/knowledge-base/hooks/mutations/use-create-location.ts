import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createLocationMutationOptions = tanstackRPC.knowledgeBase.locations.create.mutationOptions({
  onMutate: async ({ seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });
    toastSuccess('Location created successfully');
  },
  onError: (error) => {
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

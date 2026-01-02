import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createSeriesMutationOptions = tanstackRPC.series.createSeries.mutationOptions({
  onSuccess: (_data, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({ queryKey: tanstackRPC.series.listSeries.queryKey({ input: {} }) });
    toastSuccess('Series created successfully');
  },
  onError: (error) => {
    toastORPCError('Failed to create series', error);
  },
});

export function useCreateSeries() {
  const { mutate: createSeries, isPending } = useMutation(createSeriesMutationOptions);

  return {
    createSeries,
    isPending,
  };
}

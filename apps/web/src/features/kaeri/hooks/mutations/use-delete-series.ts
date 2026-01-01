import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const deleteSeriesMutationOptions = tanstackRPC.series.deleteSeries.mutationOptions({
  onSuccess: (_data, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({ queryKey: tanstackRPC.series.listSeries.queryKey({ input: {} }) });
    toastSuccess('Series deleted successfully');
  },
  onError: (error) => {
    toastORPCError('Failed to delete series', error);
  },
});

export function useDeleteSeries() {
  const { mutate: deleteSeries, isPending } = useMutation(deleteSeriesMutationOptions);

  return {
    deleteSeries,
    isPending,
  };
}

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type SeriesQueryReturnType = ORPCOutputs['series']['getSeries'];

export const updateSeriesMutationOptions = tanstackRPC.series.updateSeries.mutationOptions({
  onMutate: ({ seriesId, patch }, ctx) => {
    ctx.client.setQueryData<SeriesQueryReturnType>(
      tanstackRPC.series.getSeries.queryKey({ input: { seriesId } }),
      (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, ...patch };
      },
    );
  },
  onError: (error, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({ queryKey: tanstackRPC.series.getSeries.queryKey({ input: { seriesId } }) });
    toastORPCError('Failed to update series', error);
  },
  onSuccess: (data, { seriesId }, _context, ctx) => {
    ctx.client.setQueryData<SeriesQueryReturnType>(
      tanstackRPC.series.getSeries.queryKey({ input: { seriesId } }),
      data,
    );
    void ctx.client.invalidateQueries({ queryKey: tanstackRPC.series.listSeries.queryKey({ input: {} }) });
    toastSuccess('Series updated successfully');
  },
});

export function useUpdateSeries() {
  const { mutate: updateSeries, isPending } = useMutation(updateSeriesMutationOptions);

  return {
    updateSeries,
    isPending,
  };
}

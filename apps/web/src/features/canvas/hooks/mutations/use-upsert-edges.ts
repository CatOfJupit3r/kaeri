import { useMutation } from '@tanstack/react-query';

import { toastORPCError } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { canvasQueryOptions } from '../queries/use-canvas';
import type { CanvasQueryReturnType } from '../queries/use-canvas';

export type UpsertEdgesReturnType = ORPCOutputs['canvas']['upsertEdges'];

export const upsertEdgesMutationOptions = tanstackRPC.canvas.upsertEdges.mutationOptions({
  onMutate: ({ seriesId, edges }, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    ctx.client.setQueryData<CanvasQueryReturnType>(key, (oldData) => {
      if (!oldData) return oldData;

      const existingEdgeIds = new Set(edges.map((e) => e._id));
      const filteredEdges = oldData.edges.filter((e) => !existingEdgeIds.has(e._id));

      return {
        ...oldData,
        edges: [...filteredEdges, ...edges],
      };
    });
  },
  onError: (error, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: key });
    toastORPCError('Failed to update edges', error);
  },
  onSuccess: (data, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    ctx.client.setQueryData<CanvasQueryReturnType>(key, (oldData) => {
      if (!oldData) return oldData;

      const updatedEdgeIds = new Set(data.map((e) => e._id));
      const filteredEdges = oldData.edges.filter((e) => !updatedEdgeIds.has(e._id));

      return {
        ...oldData,
        edges: [...filteredEdges, ...data],
      };
    });
  },
});

export function useUpsertEdges() {
  const { mutate: upsertEdges, mutateAsync: upsertEdgesAsync, isPending } = useMutation(upsertEdgesMutationOptions);

  return {
    upsertEdges,
    upsertEdgesAsync,
    isPending,
  };
}

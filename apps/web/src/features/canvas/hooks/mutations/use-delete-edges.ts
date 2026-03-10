import { useMutation } from '@tanstack/react-query';

import { toastORPCError } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { canvasQueryOptions } from '../queries/use-canvas';
import type { CanvasQueryReturnType } from '../queries/use-canvas';

export const deleteEdgesMutationOptions = tanstackRPC.canvas.deleteEdges.mutationOptions({
  onMutate: ({ seriesId, edgeIds }, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    ctx.client.setQueryData<CanvasQueryReturnType>(key, (oldData) => {
      if (!oldData) return oldData;

      const edgeIdsSet = new Set(edgeIds);

      return {
        ...oldData,
        edges: oldData.edges.filter((e) => !edgeIdsSet.has(e._id)),
      };
    });
  },
  onError: (error, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: key });
    toastORPCError('Failed to delete edges', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: key });
  },
});

export function useDeleteEdges() {
  const { mutate: deleteEdges, mutateAsync: deleteEdgesAsync, isPending } = useMutation(deleteEdgesMutationOptions);

  return {
    deleteEdges,
    deleteEdgesAsync,
    isPending,
  };
}

import { useMutation } from '@tanstack/react-query';

import { toastORPCError } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { canvasQueryOptions } from '../queries/use-canvas';
import type { CanvasQueryReturnType } from '../queries/use-canvas';

export const deleteNodesMutationOptions = tanstackRPC.canvas.deleteNodes.mutationOptions({
  onMutate: ({ seriesId, nodeIds }, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    ctx.client.setQueryData<CanvasQueryReturnType>(key, (oldData) => {
      if (!oldData) return oldData;

      const nodeIdsSet = new Set(nodeIds);

      return {
        ...oldData,
        nodes: oldData.nodes.filter((n) => !nodeIdsSet.has(n._id)),
        // Also remove edges connected to deleted nodes
        edges: oldData.edges.filter((e) => !nodeIdsSet.has(e.sourceId) && !nodeIdsSet.has(e.targetId)),
      };
    });
  },
  onError: (error, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: key });
    toastORPCError('Failed to delete nodes', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: key });
  },
});

export function useDeleteNodes() {
  const { mutate: deleteNodes, mutateAsync: deleteNodesAsync, isPending } = useMutation(deleteNodesMutationOptions);

  return {
    deleteNodes,
    deleteNodesAsync,
    isPending,
  };
}

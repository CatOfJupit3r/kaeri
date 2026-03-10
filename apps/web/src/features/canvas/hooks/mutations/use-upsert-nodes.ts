import { useMutation } from '@tanstack/react-query';

import { toastORPCError } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { canvasQueryOptions } from '../queries/use-canvas';
import type { CanvasQueryReturnType } from '../queries/use-canvas';

export type UpsertNodesReturnType = ORPCOutputs['canvas']['upsertNodes'];

export const upsertNodesMutationOptions = tanstackRPC.canvas.upsertNodes.mutationOptions({
  onMutate: ({ seriesId, nodes }, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    ctx.client.setQueryData<CanvasQueryReturnType>(key, (oldData) => {
      if (!oldData) return oldData;

      const existingNodeIds = new Set(nodes.map((n) => n._id));
      const filteredNodes = oldData.nodes.filter((n) => !existingNodeIds.has(n._id));

      return {
        ...oldData,
        nodes: [...filteredNodes, ...nodes],
      };
    });
  },
  onError: (error, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: key });
    toastORPCError('Failed to update nodes', error);
  },
  onSuccess: (data, { seriesId }, _context, ctx) => {
    const key = canvasQueryOptions(seriesId).queryKey;
    ctx.client.setQueryData<CanvasQueryReturnType>(key, (oldData) => {
      if (!oldData) return oldData;

      const updatedNodeIds = new Set(data.map((n) => n._id));
      const filteredNodes = oldData.nodes.filter((n) => !updatedNodeIds.has(n._id));

      return {
        ...oldData,
        nodes: [...filteredNodes, ...data],
      };
    });
  },
});

export function useUpsertNodes() {
  const { mutate: upsertNodes, mutateAsync: upsertNodesAsync, isPending } = useMutation(upsertNodesMutationOptions);

  return {
    upsertNodes,
    upsertNodesAsync,
    isPending,
  };
}

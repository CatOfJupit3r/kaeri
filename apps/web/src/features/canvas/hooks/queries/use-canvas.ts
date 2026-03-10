import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type CanvasQueryReturnType = ORPCOutputs['canvas']['getCanvas'];

export const canvasQueryOptions = (seriesId: string) =>
  tanstackRPC.canvas.getCanvas.queryOptions({
    input: { seriesId },
  });

export function useCanvas(seriesId: string | undefined, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...canvasQueryOptions(seriesId ?? ''),
    enabled: (params.enabled ?? true) && !!seriesId,
    staleTime: 1000 * 60 * 5, // 5 minutes - canvas data changes infrequently
  });
}

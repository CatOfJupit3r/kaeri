import { useQuery } from '@tanstack/react-query';

import { PAGE_SIZES } from '@kaeri/shared';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ScriptListQueryReturnType = ORPCOutputs['scripts']['listScriptsBySeries'];
export type ScriptListItem = ScriptListQueryReturnType['items'][number];

export const scriptListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.scripts.listScriptsBySeries.queryOptions({
    input: {
      seriesId,
      limit: params.limit ?? PAGE_SIZES.DEFAULT,
      offset: params.offset ?? 0,
    },
  });

export function useScriptList(
  seriesId: string,
  limit: number = PAGE_SIZES.DEFAULT,
  offset = 0,
  params: { enabled?: boolean } = {},
) {
  return useQuery({
    ...scriptListQueryOptions(seriesId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

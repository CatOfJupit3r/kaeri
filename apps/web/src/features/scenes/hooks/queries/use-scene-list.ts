import { useQuery } from '@tanstack/react-query';

import { PAGE_SIZES } from '@kaeri/shared';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type SceneListQueryReturnType = ORPCOutputs['scene']['listScenesByScript'];
export type SceneListItem = SceneListQueryReturnType['items'][number];

export const sceneListQueryOptions = (scriptId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.scene.listScenesByScript.queryOptions({
    input: {
      scriptId,
      limit: params.limit ?? PAGE_SIZES.DEFAULT,
      offset: params.offset ?? 0,
    },
  });

export function useSceneList(
  scriptId: string,
  limit: number = PAGE_SIZES.DEFAULT,
  offset = 0,
  params: { enabled?: boolean } = {},
) {
  return useQuery({
    ...sceneListQueryOptions(scriptId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!scriptId,
  });
}

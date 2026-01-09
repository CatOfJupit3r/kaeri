import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type SceneDetailQueryReturnType = ORPCOutputs['scene']['getScene'];

export const sceneDetailQueryOptions = (sceneId: string) =>
  tanstackRPC.scene.getScene.queryOptions({
    input: { sceneId },
  });

export function useSceneDetail(sceneId: string, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...sceneDetailQueryOptions(sceneId),
    enabled: (params.enabled ?? true) && !!sceneId,
  });
}

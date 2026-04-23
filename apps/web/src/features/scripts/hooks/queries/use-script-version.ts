import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ScriptVersionQueryReturnType = ORPCOutputs['scripts']['getScriptVersion'];

export function scriptVersionQueryOptions(scriptId: string, versionId: string) {
  return {
    ...tanstackRPC.scripts.getScriptVersion.queryOptions({
      input: { scriptId, versionId },
    }),
    enabled: !!scriptId && !!versionId,
  };
}

export function useScriptVersion(scriptId: string, versionId: string) {
  return useQuery(scriptVersionQueryOptions(scriptId, versionId));
}

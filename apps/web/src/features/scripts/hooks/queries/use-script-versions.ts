import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ScriptVersionsQueryReturnType = ORPCOutputs['scripts']['listScriptVersions'];
export type ScriptVersionSummary = ScriptVersionsQueryReturnType['items'][number];

export function scriptVersionsQueryOptions(scriptId: string, limit = 20, offset = 0) {
  return {
    ...tanstackRPC.scripts.listScriptVersions.queryOptions({
      input: { scriptId, limit, offset },
    }),
    enabled: !!scriptId,
  };
}

export function useScriptVersions(scriptId: string, limit = 20, offset = 0) {
  return useQuery(scriptVersionsQueryOptions(scriptId, limit, offset));
}

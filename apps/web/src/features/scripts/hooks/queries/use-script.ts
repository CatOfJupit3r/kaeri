import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ScriptQueryReturnType = ORPCOutputs['scripts']['getScript'];

export function scriptQueryOptions(scriptId: string) {
  return {
    ...tanstackRPC.scripts.getScript.queryOptions({
      input: { scriptId },
    }),
    enabled: !!scriptId,
  };
}

export function useScript(scriptId: string) {
  return useQuery(scriptQueryOptions(scriptId));
}

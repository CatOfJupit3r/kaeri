import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Types ---

export type WorkspaceActivityReturnType = ORPCOutputs['workspace']['getWorkspaceActivity'];
export type ActivityEntry = WorkspaceActivityReturnType['entries'][number];

// --- Query Options ---

export const workspaceActivityQueryOptions = (workspaceId: string, params?: { limit?: number; offset?: number }) =>
  tanstackRPC.workspace.getWorkspaceActivity.queryOptions({
    input: {
      workspaceId,
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
    },
  });

// --- Hook ---

export function useWorkspaceActivity(
  workspaceId: string,
  params?: { limit?: number; offset?: number; enabled?: boolean },
) {
  return useQuery({
    ...workspaceActivityQueryOptions(workspaceId, params),
    enabled: params?.enabled ?? !!workspaceId,
  });
}

export type UseWorkspaceActivityType = ReturnType<typeof useWorkspaceActivity>;

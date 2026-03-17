import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Types ---

export type WorkspaceReturnType = ORPCOutputs['workspace']['getWorkspace'];

// --- Query Options ---

export const workspaceQueryOptions = (workspaceId: string) =>
  tanstackRPC.workspace.getWorkspace.queryOptions({
    input: { workspaceId },
  });

// --- Hook ---

export function useWorkspace(workspaceId: string, params?: { enabled?: boolean }) {
  return useQuery({
    ...workspaceQueryOptions(workspaceId),
    enabled: params?.enabled ?? !!workspaceId,
  });
}

export type UseWorkspaceType = ReturnType<typeof useWorkspace>;

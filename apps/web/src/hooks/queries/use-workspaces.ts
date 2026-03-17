import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Types ---

export type WorkspacesListReturnType = ORPCOutputs['workspace']['listWorkspaces'];
export type WorkspaceWithMembership = WorkspacesListReturnType['workspaces'][number];

// --- Query Options ---

export const workspacesListQueryOptions = (params?: { limit?: number; offset?: number }) =>
  tanstackRPC.workspace.listWorkspaces.queryOptions({
    input: { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
  });

// --- Hook ---

export function useWorkspaces(params?: { limit?: number; offset?: number; enabled?: boolean }) {
  return useQuery({
    ...workspacesListQueryOptions(params),
    enabled: params?.enabled ?? true,
  });
}

export type UseWorkspacesType = ReturnType<typeof useWorkspaces>;

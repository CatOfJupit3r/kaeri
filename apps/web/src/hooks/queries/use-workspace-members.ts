import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Types ---

export type WorkspaceMembersReturnType = ORPCOutputs['workspaceMember']['listMembers'];
export type WorkspaceMember = WorkspaceMembersReturnType['members'][number];

// --- Query Options ---

export const workspaceMembersQueryOptions = (workspaceId: string, params?: { limit?: number; offset?: number }) =>
  tanstackRPC.workspaceMember.listMembers.queryOptions({
    input: {
      workspaceId,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    },
  });

// --- Hook ---

export function useWorkspaceMembers(
  workspaceId: string,
  params?: { limit?: number; offset?: number; enabled?: boolean },
) {
  return useQuery({
    ...workspaceMembersQueryOptions(workspaceId, params),
    enabled: params?.enabled ?? !!workspaceId,
  });
}

export type UseWorkspaceMembersType = ReturnType<typeof useWorkspaceMembers>;

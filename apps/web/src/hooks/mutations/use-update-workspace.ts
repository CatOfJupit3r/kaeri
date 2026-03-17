import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { workspaceQueryOptions } from '@~/hooks/queries/use-workspace';
import type { WorkspaceReturnType } from '@~/hooks/queries/use-workspace';
import { workspacesListQueryOptions } from '@~/hooks/queries/use-workspaces';
import type { WorkspacesListReturnType } from '@~/hooks/queries/use-workspaces';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Mutation Options ---

export const updateWorkspaceMutationOptions = tanstackRPC.workspace.updateWorkspace.mutationOptions({
  onMutate: ({ workspaceId, patch }, ctx) => {
    const listKey = workspacesListQueryOptions().queryKey;
    const detailKey = workspaceQueryOptions(workspaceId).queryKey;

    // Optimistically update list cache
    ctx.client.setQueryData<WorkspacesListReturnType>(listKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        workspaces: oldData.workspaces.map((w) =>
          w._id === workspaceId ? { ...w, ...patch, updatedAt: new Date() } : w,
        ),
      };
    });

    // Optimistically update detail cache
    ctx.client.setQueryData<WorkspaceReturnType>(detailKey, (oldData) => {
      if (!oldData) return oldData;
      return { ...oldData, ...patch, updatedAt: new Date() };
    });
  },
  onError: (error, { workspaceId }, _context, ctx) => {
    // Invalidate to refresh from server on error
    const listKey = workspacesListQueryOptions().queryKey;
    const detailKey = workspaceQueryOptions(workspaceId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: listKey });
    void ctx.client.invalidateQueries({ queryKey: detailKey });

    toastORPCError('Failed to update workspace', error);
  },
  onSuccess: (_data, { workspaceId }, _context, ctx) => {
    const listKey = workspacesListQueryOptions().queryKey;
    const detailKey = workspaceQueryOptions(workspaceId).queryKey;

    void ctx.client.invalidateQueries({ queryKey: listKey });
    void ctx.client.invalidateQueries({ queryKey: detailKey });
    toastSuccess('Workspace updated');
  },
});

// --- Hook ---

export function useUpdateWorkspace() {
  const {
    mutate: updateWorkspace,
    mutateAsync: updateWorkspaceAsync,
    isPending,
  } = useMutation(updateWorkspaceMutationOptions);

  return {
    updateWorkspace,
    updateWorkspaceAsync,
    isPending,
  };
}

export type UseUpdateWorkspaceType = ReturnType<typeof useUpdateWorkspace>;

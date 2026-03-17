import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { workspacesListQueryOptions } from '@~/hooks/queries/use-workspaces';
import type { WorkspacesListReturnType } from '@~/hooks/queries/use-workspaces';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Mutation Options ---

export const deleteWorkspaceMutationOptions = tanstackRPC.workspace.deleteWorkspace.mutationOptions({
  onMutate: ({ workspaceId }, ctx) => {
    const listKey = workspacesListQueryOptions().queryKey;

    // Optimistically remove from list
    ctx.client.setQueryData<WorkspacesListReturnType>(listKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        workspaces: oldData.workspaces.filter((w) => w._id !== workspaceId),
        total: oldData.total - 1,
      };
    });
  },
  onError: (error, _variables, _context, ctx) => {
    // Invalidate to refresh from server on error
    const listKey = workspacesListQueryOptions().queryKey;
    void ctx.client.invalidateQueries({ queryKey: listKey });

    toastORPCError('Failed to delete workspace', error);
  },
  onSuccess: (_data, _variables, _context, ctx) => {
    const listKey = workspacesListQueryOptions().queryKey;
    void ctx.client.invalidateQueries({ queryKey: listKey });
    toastSuccess('Workspace deleted');
  },
});

// --- Hook ---

export function useDeleteWorkspace() {
  const {
    mutate: deleteWorkspace,
    mutateAsync: deleteWorkspaceAsync,
    isPending,
  } = useMutation(deleteWorkspaceMutationOptions);

  return {
    deleteWorkspace,
    deleteWorkspaceAsync,
    isPending,
  };
}

export type UseDeleteWorkspaceType = ReturnType<typeof useDeleteWorkspace>;

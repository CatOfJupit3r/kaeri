import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { workspacesListQueryOptions } from '@~/hooks/queries/use-workspaces';
import type { WorkspacesListReturnType } from '@~/hooks/queries/use-workspaces';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Mutation Options ---

export const createWorkspaceMutationOptions = tanstackRPC.workspace.createWorkspace.mutationOptions({
  onSuccess: (newWorkspace, _variables, _context, ctx) => {
    // Add the new workspace to the list cache
    ctx.client.setQueryData<WorkspacesListReturnType>(workspacesListQueryOptions().queryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        workspaces: [newWorkspace, ...oldData.workspaces],
        total: oldData.total + 1,
      };
    });
    toastSuccess('Workspace created');
  },
  onError: (error) => {
    toastORPCError('Failed to create workspace', error);
  },
});

// --- Hook ---

export function useCreateWorkspace() {
  const {
    mutate: createWorkspace,
    mutateAsync: createWorkspaceAsync,
    isPending,
  } = useMutation(createWorkspaceMutationOptions);

  return {
    createWorkspace,
    createWorkspaceAsync,
    isPending,
  };
}

export type UseCreateWorkspaceType = ReturnType<typeof useCreateWorkspace>;

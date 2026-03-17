import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { workspaceMembersQueryOptions } from '@~/hooks/queries/use-workspace-members';
import type { WorkspaceMembersReturnType } from '@~/hooks/queries/use-workspace-members';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Update Member Role ---

export const updateMemberRoleMutationOptions = tanstackRPC.workspaceMember.updateMemberRole.mutationOptions({
  onSuccess: (updatedMember, { workspaceId }, _context, ctx) => {
    const listKey = workspaceMembersQueryOptions(workspaceId).queryKey;

    // Update the member in the list cache
    ctx.client.setQueryData<WorkspaceMembersReturnType>(listKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        members: oldData.members.map((m) => (m.userId === updatedMember.userId ? updatedMember : m)),
      };
    });

    toastSuccess('Member role updated');
  },
  onError: (error) => {
    toastORPCError('Failed to update member role', error);
  },
});

export function useUpdateMemberRole() {
  const {
    mutate: updateMemberRole,
    mutateAsync: updateMemberRoleAsync,
    isPending,
  } = useMutation(updateMemberRoleMutationOptions);

  return {
    updateMemberRole,
    updateMemberRoleAsync,
    isPending,
  };
}

// --- Remove Member ---

export const removeMemberMutationOptions = tanstackRPC.workspaceMember.removeMember.mutationOptions({
  onMutate: ({ workspaceId, userId }, ctx) => {
    const listKey = workspaceMembersQueryOptions(workspaceId).queryKey;

    // Optimistically remove the member
    ctx.client.setQueryData<WorkspaceMembersReturnType>(listKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        members: oldData.members.filter((m) => m.userId !== userId),
        total: oldData.total - 1,
      };
    });
  },
  onError: (error, { workspaceId }, _context, ctx) => {
    // Invalidate to refresh from server on error
    const listKey = workspaceMembersQueryOptions(workspaceId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: listKey });

    toastORPCError('Failed to remove member', error);
  },
  onSuccess: (_data, { workspaceId }, _context, ctx) => {
    const listKey = workspaceMembersQueryOptions(workspaceId).queryKey;
    void ctx.client.invalidateQueries({ queryKey: listKey });
    toastSuccess('Member removed');
  },
});

export function useRemoveMember() {
  const { mutate: removeMember, mutateAsync: removeMemberAsync, isPending } = useMutation(removeMemberMutationOptions);

  return {
    removeMember,
    removeMemberAsync,
    isPending,
  };
}

// --- Leave Workspace ---

export const leaveWorkspaceMutationOptions = tanstackRPC.workspaceMember.leaveWorkspace.mutationOptions({
  onSuccess: () => {
    toastSuccess('You have left the workspace');
  },
  onError: (error) => {
    toastORPCError('Failed to leave workspace', error);
  },
});

export function useLeaveWorkspace() {
  const {
    mutate: leaveWorkspace,
    mutateAsync: leaveWorkspaceAsync,
    isPending,
  } = useMutation(leaveWorkspaceMutationOptions);

  return {
    leaveWorkspace,
    leaveWorkspaceAsync,
    isPending,
  };
}

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { invitationsListQueryOptions, myInvitationsQueryOptions } from '@~/hooks/queries/use-invitations';
import type { InvitationsListReturnType } from '@~/hooks/queries/use-invitations';
import { workspacesListQueryOptions } from '@~/hooks/queries/use-workspaces';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Create Invitation ---

export const createInvitationMutationOptions = tanstackRPC.invitation.createInvitation.mutationOptions({
  onSuccess: (newInvitation, { workspaceId }, _context, ctx) => {
    // Add the new invitation to the list cache
    ctx.client.setQueryData<InvitationsListReturnType>(invitationsListQueryOptions(workspaceId).queryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        invitations: [newInvitation, ...oldData.invitations],
        total: oldData.total + 1,
      };
    });
    toastSuccess('Invitation sent');
  },
  onError: (error) => {
    toastORPCError('Failed to send invitation', error);
  },
});

export function useCreateInvitation() {
  const {
    mutate: createInvitation,
    mutateAsync: createInvitationAsync,
    isPending,
  } = useMutation(createInvitationMutationOptions);

  return {
    createInvitation,
    createInvitationAsync,
    isPending,
  };
}

// --- Accept Invitation ---

export const acceptInvitationMutationOptions = tanstackRPC.invitation.acceptInvitation.mutationOptions({
  onSuccess: (_result, _variables, _context, ctx) => {
    // Invalidate workspace list to include new workspace
    void ctx.client.invalidateQueries({ queryKey: workspacesListQueryOptions().queryKey });
    // Invalidate my invitations list
    void ctx.client.invalidateQueries({ queryKey: myInvitationsQueryOptions().queryKey });
    toastSuccess('Invitation accepted');
  },
  onError: (error) => {
    toastORPCError('Failed to accept invitation', error);
  },
});

export function useAcceptInvitation() {
  const {
    mutate: acceptInvitation,
    mutateAsync: acceptInvitationAsync,
    isPending,
  } = useMutation(acceptInvitationMutationOptions);

  return {
    acceptInvitation,
    acceptInvitationAsync,
    isPending,
  };
}

// --- Decline Invitation ---

export const declineInvitationMutationOptions = tanstackRPC.invitation.declineInvitation.mutationOptions({
  onSuccess: (_result, _variables, _context, ctx) => {
    // Invalidate my invitations list
    void ctx.client.invalidateQueries({ queryKey: myInvitationsQueryOptions().queryKey });
    toastSuccess('Invitation declined');
  },
  onError: (error) => {
    toastORPCError('Failed to decline invitation', error);
  },
});

export function useDeclineInvitation() {
  const {
    mutate: declineInvitation,
    mutateAsync: declineInvitationAsync,
    isPending,
  } = useMutation(declineInvitationMutationOptions);

  return {
    declineInvitation,
    declineInvitationAsync,
    isPending,
  };
}

// --- Revoke Invitation ---

export const revokeInvitationMutationOptions = tanstackRPC.invitation.revokeInvitation.mutationOptions({
  onMutate: ({ workspaceId, invitationId }, ctx) => {
    const listKey = invitationsListQueryOptions(workspaceId).queryKey;

    // Optimistically remove the invitation
    ctx.client.setQueryData<InvitationsListReturnType>(listKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        invitations: oldData.invitations.filter((inv) => inv._id !== invitationId),
        total: Math.max(0, oldData.total - 1),
      };
    });
  },
  onSuccess: () => {
    toastSuccess('Invitation revoked');
  },
  onError: (error, { workspaceId }, _context, ctx) => {
    // Invalidate on error to restore original state
    void ctx.client.invalidateQueries({ queryKey: invitationsListQueryOptions(workspaceId).queryKey });
    toastORPCError('Failed to revoke invitation', error);
  },
});

export function useRevokeInvitation() {
  const {
    mutate: revokeInvitation,
    mutateAsync: revokeInvitationAsync,
    isPending,
  } = useMutation(revokeInvitationMutationOptions);

  return {
    revokeInvitation,
    revokeInvitationAsync,
    isPending,
  };
}

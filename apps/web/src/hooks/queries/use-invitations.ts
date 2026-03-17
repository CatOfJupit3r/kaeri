import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// --- Types ---

export type InvitationsListReturnType = ORPCOutputs['invitation']['listInvitations'];
export type Invitation = InvitationsListReturnType['invitations'][number];

export type MyInvitationsReturnType = ORPCOutputs['invitation']['getMyInvitations'];
export type InvitationPreviewReturnType = ORPCOutputs['invitation']['getInvitationByCode'];

// --- Query Options ---

export const invitationsListQueryOptions = (workspaceId: string) =>
  tanstackRPC.invitation.listInvitations.queryOptions({
    input: { workspaceId },
  });

export const myInvitationsQueryOptions = () =>
  tanstackRPC.invitation.getMyInvitations.queryOptions({
    input: {},
  });

export const invitationByCodeQueryOptions = (code: string) =>
  tanstackRPC.invitation.getInvitationByCode.queryOptions({
    input: { code },
  });

// --- Hooks ---

export function useInvitationsList(workspaceId: string) {
  return useQuery(invitationsListQueryOptions(workspaceId));
}

export function useMyInvitations() {
  return useQuery(myInvitationsQueryOptions());
}

export function useInvitationByCode(code: string) {
  return useQuery(invitationByCodeQueryOptions(code));
}

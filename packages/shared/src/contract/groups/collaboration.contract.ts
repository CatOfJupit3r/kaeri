/**
 * Collaboration contracts - workspaces, members, invitations, presence
 */
import invitationContract from '../invitation.contract';
import presenceContract from '../presence.contract';
import workspaceMemberContract from '../workspace-member.contract';
import workspaceContract from '../workspace.contract';

export const COLLABORATION_CONTRACT = {
  workspace: workspaceContract,
  workspaceMember: workspaceMemberContract,
  invitation: invitationContract,
  presence: presenceContract,
};

export type CollaborationContract = typeof COLLABORATION_CONTRACT;

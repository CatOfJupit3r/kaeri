/**
 * Collaboration contracts - workspaces, members, invitations
 */
import invitationContract from '../invitation.contract';
import workspaceMemberContract from '../workspace-member.contract';
import workspaceContract from '../workspace.contract';

export const COLLABORATION_CONTRACT = {
  workspace: workspaceContract,
  workspaceMember: workspaceMemberContract,
  invitation: invitationContract,
};

export type CollaborationContract = typeof COLLABORATION_CONTRACT;

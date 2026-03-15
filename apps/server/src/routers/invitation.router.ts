import { INVITATION_STATUS } from '@kaeri/shared';

import { collaborationBase, collaborationProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const invitationRouter = collaborationBase.invitation.router({
  createInvitation: collaborationProtected.invitation.createInvitation.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const invitation = await GETTERS.InvitationService().create(userId, {
      workspaceId: input.workspaceId,
      email: input.email,
      role: input.role,
    });

    return {
      _id: invitation._id,
      workspaceId: invitation.workspaceId,
      workspaceName: '', // TODO: populate from workspace
      invitedEmail: invitation.invitedEmail,
      invitedByUserId: invitation.invitedByUserId,
      invitedByName: '', // TODO: populate from user
      role: invitation.role,
      code: invitation.code,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  }),

  listInvitations: collaborationProtected.invitation.listInvitations.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const result = await GETTERS.InvitationService().listForWorkspace(userId, input.workspaceId, {
      status: input.status,
      limit: input.limit,
    });

    return {
      invitations: result.invitations.map((inv) => ({
        _id: inv._id,
        workspaceId: inv.workspaceId,
        workspaceName: '', // TODO: populate
        invitedEmail: inv.invitedEmail,
        invitedByUserId: inv.invitedByUserId,
        invitedByName: '', // TODO: populate
        role: inv.role,
        code: inv.code,
        status: inv.status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
      total: result.invitations.length,
    };
  }),

  getInvitationByCode: collaborationProtected.invitation.getInvitationByCode.handler(async ({ input }) => {
    const invitation = await GETTERS.InvitationService().getByCode(input.code);
    const isExpired = invitation.expiresAt < new Date() || invitation.status !== INVITATION_STATUS.PENDING;

    return {
      _id: invitation._id,
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspace.name,
      invitedEmail: invitation.invitedEmail,
      invitedByUserId: invitation.invitedByUserId,
      invitedByName: '', // TODO: populate
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      isExpired,
      requiresSignup: false, // TODO: check if email belongs to existing user
    };
  }),

  acceptInvitation: collaborationProtected.invitation.acceptInvitation.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const userEmail = context.session.user.email;

    // Get invitation to return role
    const invitation = await GETTERS.InvitationService().getByCode(input.code);

    await GETTERS.InvitationService().accept(userId, userEmail, input.code);

    return {
      success: true,
      workspaceId: invitation.workspaceId,
      role: invitation.role,
    };
  }),

  declineInvitation: collaborationProtected.invitation.declineInvitation.handler(async ({ input, context }) => {
    const userEmail = context.session.user.email;
    await GETTERS.InvitationService().decline(userEmail, input.code);
    return { success: true };
  }),

  revokeInvitation: collaborationProtected.invitation.revokeInvitation.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await GETTERS.InvitationService().revoke(userId, input.invitationId);
    return { success: true };
  }),

  getMyInvitations: collaborationProtected.invitation.getMyInvitations.handler(async ({ context }) => {
    const userEmail = context.session.user.email;
    const result = await GETTERS.InvitationService().listMyInvitations(userEmail);

    return {
      invitations: result.invitations.map((inv) => ({
        _id: inv._id,
        workspaceId: inv.workspaceId,
        workspaceName: inv.workspace.name,
        invitedEmail: inv.invitedEmail,
        invitedByUserId: inv.invitedByUserId,
        invitedByName: '', // TODO: populate
        role: inv.role,
        code: inv.code,
        status: inv.status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    };
  }),
});

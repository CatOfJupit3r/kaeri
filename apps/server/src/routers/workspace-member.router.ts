import { collaborationBase, collaborationProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const workspaceMemberRouter = collaborationBase.workspaceMember.router({
  listMembers: collaborationProtected.workspaceMember.listMembers.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const result = await GETTERS.MemberService().listMembers(userId, input.workspaceId, {
      limit: input.limit,
    });
    return {
      members: result.members,
      total: result.total,
    };
  }),

  updateMemberRole: collaborationProtected.workspaceMember.updateMemberRole.handler(async ({ input, context }) => {
    const actorId = context.session.user.id;
    const member = await GETTERS.MemberService().updateMemberRole(
      actorId,
      input.workspaceId,
      input.userId,
      input.newRole,
    );
    return {
      _id: member._id,
      workspaceId: member.workspaceId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }),

  removeMember: collaborationProtected.workspaceMember.removeMember.handler(async ({ input, context }) => {
    const actorId = context.session.user.id;
    await GETTERS.MemberService().removeMember(actorId, input.workspaceId, input.userId);
    return { success: true };
  }),

  leaveWorkspace: collaborationProtected.workspaceMember.leaveWorkspace.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await GETTERS.MemberService().leaveWorkspace(userId, input.workspaceId);
    return { success: true };
  }),
});

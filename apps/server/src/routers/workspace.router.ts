import { collaborationBase, collaborationProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const workspaceRouter = collaborationBase.workspace.router({
  createWorkspace: collaborationProtected.workspace.createWorkspace.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    return GETTERS.WorkspaceService().create(userId, input);
  }),

  updateWorkspace: collaborationProtected.workspace.updateWorkspace.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    return GETTERS.WorkspaceService().update(input.workspaceId, userId, input.patch);
  }),

  deleteWorkspace: collaborationProtected.workspace.deleteWorkspace.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await GETTERS.WorkspaceService().delete(input.workspaceId, userId);
    return { success: true };
  }),

  getWorkspace: collaborationProtected.workspace.getWorkspace.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    return GETTERS.WorkspaceService().get(input.workspaceId, userId);
  }),

  listWorkspaces: collaborationProtected.workspace.listWorkspaces.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    return GETTERS.WorkspaceService().list(userId, input.limit, input.offset);
  }),

  transferOwnership: collaborationProtected.workspace.transferOwnership.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await GETTERS.WorkspaceService().transferOwnership(input.workspaceId, userId, input.newOwnerId);
    return { success: true };
  }),

  getWorkspaceActivity: collaborationProtected.workspace.getWorkspaceActivity.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    return GETTERS.WorkspaceService().getActivity(input.workspaceId, userId, input.limit, input.offset);
  }),
});

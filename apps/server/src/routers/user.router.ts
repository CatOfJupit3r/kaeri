import { coreBase, coreProtected, corePublic } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const userRouter = coreBase.user.router({
  getUserProfile: coreProtected.user.getUserProfile.handler(async ({ context }) => {
    const userId = context.session.user.id;
    return GETTERS.UserService().getUserProfile(userId);
  }),

  updateUserProfile: coreProtected.user.updateUserProfile.handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    return GETTERS.UserService().updateUserProfile(userId, input.bio);
  }),

  updateUserBadge: coreProtected.user.updateUserBadge.handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const { badgeId } = input;
    return GETTERS.UserService().updateUserBadge(userId, badgeId);
  }),

  regeneratePublicCode: coreProtected.user.regeneratePublicCode.handler(async ({ context }) => {
    const userId = context.session.user.id;
    return GETTERS.UserService().regeneratePublicCode(userId);
  }),

  devToolsListAllUsers: corePublic.user.devToolsListAllUsers.handler(async () => GETTERS.UserService().listAllUsers()),
});

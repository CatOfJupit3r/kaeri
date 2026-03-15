import { gamificationBase, gamificationProtected, gamificationPublic } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const achievementsRouter = gamificationBase.achievements.router({
  listAchievements: gamificationPublic.achievements.listAchievements.handler(async () =>
    GETTERS.AchievementsService().listAllAchievements(),
  ),

  getMyAchievements: gamificationProtected.achievements.getMyAchievements.handler(async ({ context }) => {
    const userId = context.session.user.id;
    return GETTERS.AchievementsService().getUserAchievements(userId);
  }),
});

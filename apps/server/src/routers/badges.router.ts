import { gamificationBase, gamificationPublic } from '@~/lib/orpc';

import { GETTERS } from './di-getter';

export const badgesRouter = gamificationBase.badges.router({
  listBadges: gamificationPublic.badges.listBadges.handler(async () => GETTERS.BadgesService().listAllBadges()),
});

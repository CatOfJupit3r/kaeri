import { USER_ACHIEVEMENTS } from '@kaeri/shared/constants/achievements';

import { EVENTS } from '@~/features/events/events.constants';

import { defineAchievement } from '../achievements.types';
import type { iAchievementContext } from '../achievements.types';

export const betaTesterAchievement = defineAchievement({
  id: USER_ACHIEVEMENTS.BETA_TESTER,
  listensTo: [EVENTS.BETA_EVENT] as const,
  async handle(payload, _, context: iAchievementContext) {
    await context.unlock(payload.userId, USER_ACHIEVEMENTS.BETA_TESTER, {});
  },
});

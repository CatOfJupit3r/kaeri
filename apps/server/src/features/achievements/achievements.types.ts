import type { UserAchievementId } from '@kaeri/shared/constants/achievements';

import type { iEventPayloadMap, EventType } from '@~/features/events/events.constants';

export interface iAchievementContext {
  unlock: <T extends UserAchievementId>(
    userId: string,
    achievementId: T,
    data?: Record<string, unknown>,
  ) => Promise<unknown>;
}

export interface iAchievementDefinition<TEvents extends readonly EventType[]> {
  id: UserAchievementId;
  listensTo: TEvents;

  handle: <E extends TEvents[number]>(
    payload: iEventPayloadMap[E],
    event: E,
    context: iAchievementContext,
  ) => Promise<unknown>;
}

export function defineAchievement<const TEvents extends readonly EventType[]>(
  def: iAchievementDefinition<TEvents>,
): iAchievementDefinition<TEvents> {
  return def;
}

import { inject, singleton } from 'tsyringe';

import type { UserAchievementId } from '@kaeri/shared/constants/achievements';

import { UserAchievementModel } from '@~/db/models/user-achievements.model';
import { TOKENS } from '@~/di/tokens';
import { TypedEventBus } from '@~/features/events/event-bus';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';

import type { EventType } from '../events/events.constants';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';
import type { ValkeyService } from '../valkey/valkey.service';
import { USER_ACHIEVEMENTS_META } from './achievements.constants';
import type { iAchievementContext, iAchievementDefinition } from './achievements.types';
import { betaTesterAchievement } from './concrete-achievements/beta-tester.achievement';

@singleton()
export class AchievementsService implements iWithLogger {
  private achievements: Array<iAchievementDefinition<readonly EventType[]>>;

  public readonly logger: iWithLogger['logger'];

  private context: iAchievementContext = {
    unlock: async (userId: string, achievementId: UserAchievementId, data?: Record<string, unknown>) => {
      const existingAchievement = await UserAchievementModel.findOne({ userId, achievementId });

      if (existingAchievement) {
        return;
      }

      await UserAchievementModel.create({
        userId,
        achievementId,
        unlockedAt: new Date(),
        data,
      });

      // Invalidate user achievements cache
      await this.valkey.cacheDel(buildCacheKey.userAchievements(userId));
      this.logger.info('Achievement unlocked, cache invalidated', { userId, achievementId });
    },
  };

  constructor(
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
  ) {
    this.logger = loggerFactory.create('achievements');
    this.achievements = [betaTesterAchievement];
    this.initialize();
  }

  public initialize() {
    for (const achievement of this.achievements) {
      for (const event of achievement.listensTo) {
        this.eventBus.on(event, async (payload) => {
          try {
            await achievement.handle(payload, event, this.context);
          } catch (error) {
            this.logger.error(`Error handling achievement ${achievement.id} for event ${event}:`, { error });
          }
        });
      }
    }
  }

  public async listAllAchievements() {
    return this.valkey.cached(buildCacheKey.achievements(), CACHE_TTL.STATIC, async () => {
      this.logger.debug('Fetching achievements from constants');
      return USER_ACHIEVEMENTS_META;
    });
  }

  public async getUserAchievements(userId: string) {
    return this.valkey.cached(buildCacheKey.userAchievements(userId), CACHE_TTL.USER_DATA, async () => {
      this.logger.debug('Fetching user achievements from database', { userId });
      const userAchievements = await UserAchievementModel.find({ userId });

      return userAchievements.map((achievement) => {
        const meta = USER_ACHIEVEMENTS_META.find((m) => m.id === achievement.achievementId);
        return {
          id: achievement.achievementId,
          unlockedAt: achievement.unlockedAt,
          data: achievement.data,
          meta: meta ?? {
            id: achievement.achievementId,
            label: achievement.achievementId,
            description: 'Achievement',
          },
        };
      });
    });
  }
}

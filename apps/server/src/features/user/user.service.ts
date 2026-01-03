import { inject, injectable } from 'tsyringe';

import { errorCodes } from '@kaeri/shared';
import type { BadgeId } from '@kaeri/shared/constants/badges';

import { generatePublicCode } from '@~/db/helpers';
import { User } from '@~/db/models/auth.model';
import { UserAchievementModel } from '@~/db/models/user-achievements.model';
import { UserProfileModel } from '@~/db/models/user-profile.model';
import { TOKENS } from '@~/di/tokens';
import { BADGES_META } from '@~/features/badges/badges.constants';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import {
  ORPCBadRequestError,
  ORPCForbiddenError,
  ORPCInternalServerError,
  ORPCNotFoundError,
} from '@~/lib/orpc-error-wrapper';

import type { iWithLogger, LoggerFactory } from '../logger/logger.types';
import type { ValkeyService } from '../valkey/valkey.service';

@injectable()
export class UserService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
  ) {
    this.logger = loggerFactory.create('user-service');
  }

  public async getUserProfile(userId: string) {
    return this.valkey.cached(buildCacheKey.userProfile(userId), CACHE_TTL.USER_DATA, async () => {
      this.logger.debug('Fetching user profile from database', { userId });
      const userProfile = await UserProfileModel.findOne({ userId });
      if (!userProfile) throw ORPCNotFoundError(errorCodes.USER_PROFILE_NOT_FOUND);
      return userProfile;
    });
  }

  public async updateUserProfile(userId: string, bio: string) {
    try {
      const updatedProfile = await UserProfileModel.findOneAndUpdate(
        { userId },
        { bio },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      if (!updatedProfile) {
        throw ORPCInternalServerError();
      }

      // Invalidate cache
      await this.valkey.cacheDel(buildCacheKey.userProfile(userId));
      this.logger.info('User profile updated, cache invalidated', { userId });

      return updatedProfile;
    } catch (error) {
      if (error instanceof Error && error.name !== 'ORPCError') {
        throw ORPCInternalServerError();
      }
      throw error;
    }
  }

  public async updateUserBadge(userId: string, badgeId: BadgeId) {
    const badgeMeta = BADGES_META.find((b) => b.id === badgeId);
    if (!badgeMeta) {
      throw ORPCBadRequestError(errorCodes.BADGE_NOT_FOUND);
    }

    if (badgeMeta.requiresAchievement) {
      const hasAchievement = await UserAchievementModel.findOne({
        userId,
        achievementId: badgeMeta.requiresAchievement,
      });

      if (!hasAchievement) {
        throw ORPCForbiddenError(errorCodes.USER_BADGE_NOT_ALLOWED);
      }
    }

    try {
      const updatedProfile = await UserProfileModel.findOneAndUpdate(
        { userId },
        { selectedBadge: badgeId },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      if (!updatedProfile) {
        throw ORPCInternalServerError();
      }

      // Invalidate cache
      await this.valkey.cacheDel(buildCacheKey.userProfile(userId));
      this.logger.info('User badge updated, cache invalidated', { userId, badgeId });

      return updatedProfile;
    } catch (error) {
      if (error instanceof Error && error.name !== 'ORPCError') {
        throw ORPCInternalServerError();
      }
      throw error;
    }
  }

  public async regeneratePublicCode(userId: string) {
    const maxAttempts = 10;
    const tryGenerateCode = async (attemptNumber: number): Promise<typeof UserProfileModel.prototype> => {
      if (attemptNumber >= maxAttempts) {
        throw ORPCInternalServerError(errorCodes.PUBLIC_CODE_GENERATION_FAILED);
      }

      const newPublicCode = generatePublicCode();

      try {
        const updatedProfile = await UserProfileModel.findOneAndUpdate(
          { userId },
          { publicCode: newPublicCode },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        if (!updatedProfile) {
          throw ORPCInternalServerError();
        }

        // Invalidate cache
        await this.valkey.cacheDel(buildCacheKey.userProfile(userId));
        this.logger.info('Public code regenerated, cache invalidated', { userId });

        return updatedProfile;
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000) {
          return tryGenerateCode(attemptNumber + 1);
        }

        if (error instanceof Error && error.name !== 'ORPCError') {
          throw ORPCInternalServerError();
        }

        throw error;
      }
    };

    return tryGenerateCode(0);
  }

  public async listAllUsers() {
    const users = await User.find({}, { _id: 1, name: 1 });
    return users.map(({ _id, name }) => ({ _id: _id.toString(), name }));
  }
}

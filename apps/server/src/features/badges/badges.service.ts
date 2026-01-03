import { inject, singleton } from 'tsyringe';

import { TOKENS } from '@~/di/tokens';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';

import type { iWithLogger, LoggerFactory } from '../logger/logger.types';
import type { ValkeyService } from '../valkey/valkey.service';
import { BADGES_META } from './badges.constants';

@singleton()
export class BadgesService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
  ) {
    this.logger = loggerFactory.create('badges');
  }

  public async listAllBadges() {
    this.logger.debug('Listing all badges');

    return this.valkey.cached(buildCacheKey.badges(), CACHE_TTL.STATIC, async () => {
      this.logger.debug('Fetching badges from constants');
      return BADGES_META;
    });
  }
}

import { inject, singleton } from 'tsyringe';

import { TOKENS } from '@~/di/tokens';
import type { TypedEventBus } from '@~/features/events/event-bus';
import type { iRegistrationCtx } from '@~/types/registration.types';

import { EVENTS } from '../events/events.constants';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';
import { buildCacheKey, CACHE_PREFIX } from './valkey.constants';
import type { ValkeyService } from './valkey.service';

/**
 * Service responsible for listening to domain events and invalidating cache accordingly
 */
@singleton()
export class CacheInvalidationService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('cache-invalidation');
  }

  /**
   * Register all event handlers for cache invalidation
   */
  public static handleRegistration({ container, token }: iRegistrationCtx) {
    const service = container.resolve<CacheInvalidationService>(token);
    service.registerEventHandlers();
  }

  /**
   * Register all domain event handlers
   */
  private registerEventHandlers() {
    this.registerSeriesEventHandlers();
    this.registerKnowledgeBaseEventHandlers();
    this.registerCanvasEventHandlers();

    this.logger.info('Cache invalidation event handlers registered');
  }

  /**
   * Register series event handlers
   */
  private registerSeriesEventHandlers() {
    this.eventBus.on(EVENTS.SERIES_CREATED, async ({ seriesId }) => {
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.SERIES_LIST}:*`);
      this.logger.debug('Series created, invalidated series lists', { seriesId });
    });

    this.eventBus.on(EVENTS.SERIES_UPDATED, async ({ seriesId }) => {
      await this.valkey.cacheDel(buildCacheKey.series(seriesId));
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.SERIES_LIST}:*`);
      await this.valkey.cacheDel(buildCacheKey.exportSeriesJson(seriesId));
      this.logger.debug('Series updated, invalidated caches', { seriesId });
    });

    this.eventBus.on(EVENTS.SERIES_DELETED, async ({ seriesId }) => {
      await this.valkey.cacheDel(buildCacheKey.series(seriesId));
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.SERIES_LIST}:*`);
      await this.valkey.cacheDel(buildCacheKey.exportSeriesJson(seriesId));
      // Also invalidate all series-related caches
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.KB}:${seriesId}:*`);
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.CANVAS}:${seriesId}*`);
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.CONTINUITY}:${seriesId}:*`);
      this.logger.debug('Series deleted, invalidated all related caches', { seriesId });
    });
  }

  /**
   * Register knowledge base event handlers
   */
  private registerKnowledgeBaseEventHandlers() {
    const kbRegistrations = [
      { event: EVENTS.KNOWLEDGE_BASE_CHARACTER_ACTION, entityType: 'character' as const },
      { event: EVENTS.KNOWLEDGE_BASE_LOCATION_ACTION, entityType: 'location' as const },
      { event: EVENTS.KNOWLEDGE_BASE_PROP_ACTION, entityType: 'prop' as const },
      { event: EVENTS.KNOWLEDGE_BASE_TIMELINE_ACTION, entityType: 'timeline' as const },
      { event: EVENTS.KNOWLEDGE_BASE_WILDCARD_ACTION, entityType: 'wildcard' as const },
    ];

    const handleKbAction = async (
      seriesId: string,
      entityId: string,
      entityType: 'character' | 'location' | 'prop' | 'timeline' | 'wildcard',
      action: 'created' | 'updated' | 'deleted',
    ) => {
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.KB}:${seriesId}:${entityType}:*`);
      await this.valkey.invalidatePattern(`${CACHE_PREFIX.KB}:${seriesId}:search:*`);

      if (entityType !== 'wildcard') {
        await this.valkey.cacheDel(buildCacheKey.continuityGraph(seriesId));
      }

      if (entityType === 'character') {
        await this.valkey.invalidatePattern(`${CACHE_PREFIX.CONTINUITY}:${seriesId}:appearances:*`);
        await this.valkey.cacheDel(buildCacheKey.appearancesByCharacter(seriesId, entityId));
      }

      await this.valkey.cacheDel(buildCacheKey.exportSeriesJson(seriesId));
      this.logger.debug('KB entity action invalidated caches', { seriesId, entityType, action });
    };

    for (const { event, entityType } of kbRegistrations) {
      this.eventBus.on(event, async ({ seriesId, entityId, action }) =>
        handleKbAction(seriesId, entityId, entityType, action),
      );
    }
  }

  /**
   * Register canvas event handlers
   */
  private registerCanvasEventHandlers() {
    this.eventBus.on(EVENTS.NODES_UPSERTED, async ({ seriesId }) => {
      await this.valkey.cacheDel(buildCacheKey.canvas(seriesId));
      this.logger.debug('Canvas nodes upserted, invalidated canvas cache', { seriesId });
    });

    this.eventBus.on(EVENTS.EDGES_UPSERTED, async ({ seriesId }) => {
      await this.valkey.cacheDel(buildCacheKey.canvas(seriesId));
      this.logger.debug('Canvas edges upserted, invalidated canvas cache', { seriesId });
    });

    this.eventBus.on(EVENTS.NODES_DELETED, async ({ seriesId }) => {
      await this.valkey.cacheDel(buildCacheKey.canvas(seriesId));
      this.logger.debug('Canvas nodes deleted, invalidated canvas cache', { seriesId });
    });

    this.eventBus.on(EVENTS.EDGES_DELETED, async ({ seriesId }) => {
      await this.valkey.cacheDel(buildCacheKey.canvas(seriesId));
      this.logger.debug('Canvas edges deleted, invalidated canvas cache', { seriesId });
    });
  }
}

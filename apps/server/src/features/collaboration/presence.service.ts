import { inject, injectable } from 'tsyringe';

import type { PresenceTargetType } from '@kaeri/shared/contract/presence.contract';

import { User } from '@~/db/models/auth.model';
import { TOKENS } from '@~/di/tokens';
import type { iWithLogger, LoggerFactory } from '@~/features/logger/logger.types';
import { buildCacheKey, CACHE_PREFIX, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import type { ValkeyService } from '@~/features/valkey/valkey.service';

interface iPresenceData {
  userId: string;
  targetType: PresenceTargetType;
  targetId: string;
  context?: string;
  /** ISO string */
  lastSeen: string;
}

interface iPresenceEntry extends iPresenceData {
  user?: {
    _id: string;
    name: string;
    image?: string;
  };
}

interface iPresenceAggregate {
  targetType: PresenceTargetType;
  targetId: string;
  users: iPresenceEntry[];
  count: number;
}

/**
 * PresenceService manages real-time presence tracking using Valkey.
 *
 * Key features:
 * - 60-second TTL for presence entries (auto-expire if no heartbeat)
 * - Pattern-based queries for getting all users on a target
 * - Series-wide presence aggregation
 */
@injectable()
export class PresenceService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
  ) {
    this.logger = loggerFactory.create('presence-service');
  }

  /**
   * Update user presence (heartbeat).
   * Sets/refreshes presence with 60-second TTL.
   */
  public async heartbeat(
    userId: string,
    targetType: PresenceTargetType,
    targetId: string,
    context?: string,
  ): Promise<{ success: boolean }> {
    const key = buildCacheKey.presence(targetType, targetId, userId);
    const data: iPresenceData = {
      userId,
      targetType,
      targetId,
      context,
      lastSeen: new Date().toISOString(),
    };

    await this.valkey.cacheSet(key, data, CACHE_TTL.PRESENCE);

    this.logger.debug('Presence heartbeat', { userId, targetType, targetId, context });

    return { success: true };
  }

  /**
   * Clear presence for a user on a specific target.
   */
  public async clearPresence(
    userId: string,
    targetType: PresenceTargetType,
    targetId: string,
  ): Promise<{ success: boolean }> {
    const key = buildCacheKey.presence(targetType, targetId, userId);
    await this.valkey.cacheDel(key);

    this.logger.debug('Presence cleared', { userId, targetType, targetId });

    return { success: true };
  }

  /**
   * Get all users present on a specific target (series, script, or scene).
   */
  public async getPresence(targetType: PresenceTargetType, targetId: string): Promise<iPresenceAggregate> {
    const pattern = buildCacheKey.presencePattern(targetType, targetId);
    const entries = await this.getPresenceByPattern(pattern);

    // Enrich with user data
    const enrichedEntries = await this.enrichPresenceWithUsers(entries);

    return {
      targetType,
      targetId,
      users: enrichedEntries,
      count: enrichedEntries.length,
    };
  }

  /**
   * Get all presence entries across a series (series itself + scripts + scenes).
   */
  public async getSeriesPresence(seriesId: string): Promise<{
    series: iPresenceAggregate | undefined;
    scripts: iPresenceAggregate[];
    scenes: iPresenceAggregate[];
    totalUniqueUsers: number;
  }> {
    // Get presence for series itself
    const seriesPresence = await this.getPresence('series', seriesId);

    // Get all presence entries that reference this series
    // For scripts and scenes, we need to query by their target type and match seriesId
    // However, we don't store seriesId in the key for scripts/scenes
    // So we need a different approach - query all scripts/scenes and filter by series

    // For now, we'll return just the series presence
    // In a full implementation, we'd need to either:
    // 1. Store presence with seriesId in the key
    // 2. Query scripts/scenes from DB that belong to this series and check their presence
    // Let's implement option 2

    const scriptPresences = await this.getPresenceForSeriesChildren('script', seriesId);
    const scenePresences = await this.getPresenceForSeriesChildren('scene', seriesId);

    // Collect all unique user IDs
    const allUserIds = new Set<string>();
    if (seriesPresence.count > 0) {
      seriesPresence.users.forEach((u) => allUserIds.add(u.userId));
    }
    scriptPresences.forEach((p) => p.users.forEach((u) => allUserIds.add(u.userId)));
    scenePresences.forEach((p) => p.users.forEach((u) => allUserIds.add(u.userId)));

    return {
      series: seriesPresence.count > 0 ? seriesPresence : undefined,
      scripts: scriptPresences,
      scenes: scenePresences,
      totalUniqueUsers: allUserIds.size,
    };
  }

  /**
   * Get presence for children (scripts/scenes) of a series.
   * This is more complex as we need to match against series relationships.
   */
  private async getPresenceForSeriesChildren(
    targetType: 'script' | 'scene',
    _seriesId: string,
  ): Promise<iPresenceAggregate[]> {
    // For a complete implementation, we would:
    // 1. Get all script/scene IDs that belong to this series from DB
    // 2. Check presence for each

    // For MVP, we'll scan all presence keys of this type and filter
    // This is acceptable for small-medium scale

    const pattern = `${CACHE_PREFIX.PRESENCE}:${targetType}:*`;
    const entries = await this.getPresenceByPattern(pattern);

    // Group by targetId
    const grouped = new Map<string, iPresenceData[]>();
    for (const entry of entries) {
      const existing = grouped.get(entry.targetId) ?? [];
      existing.push(entry);
      grouped.set(entry.targetId, existing);
    }

    // Convert to aggregates with user enrichment
    const aggregatePromises = [...grouped.entries()].map(async ([targetId, presenceEntries]) => {
      const enriched = await this.enrichPresenceWithUsers(presenceEntries);
      return {
        targetType,
        targetId,
        users: enriched,
        count: enriched.length,
      };
    });

    return Promise.all(aggregatePromises);
  }

  /**
   * Get presence entries matching a pattern.
   */
  private async getPresenceByPattern(pattern: string): Promise<iPresenceData[]> {
    // @ts-expect-error - Accessing private client for pattern scan; consider exposing a scan method in ValkeyService
    const { client } = this.valkey;
    if (!client) return [];

    try {
      const keys = await client.keys(pattern);
      if (keys.length === 0) return [];

      const values = await client.mget(keys);
      const entries: iPresenceData[] = [];

      for (const value of values) {
        if (value) {
          try {
            const parsed = JSON.parse(value) as iPresenceData;
            entries.push(parsed);
          } catch {
            // Skip malformed entries
          }
        }
      }

      return entries;
    } catch {
      return [];
    }
  }

  /**
   * Enrich presence entries with user information.
   */
  private async enrichPresenceWithUsers(entries: iPresenceData[]): Promise<iPresenceEntry[]> {
    if (entries.length === 0) return [];

    const userIds = [...new Set(entries.map((e) => e.userId))];
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id name image')
      .lean();

    const userMap = new Map(users.map((u) => [u._id, u]));

    return entries.map((entry) => {
      const user = userMap.get(entry.userId);
      return {
        ...entry,
        user: user
          ? {
              _id: user._id,
              name: user.name,
              image: user.image ?? undefined,
            }
          : undefined,
      };
    });
  }
}

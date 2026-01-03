import Redis from 'ioredis';
import { isNil } from 'lodash-es';
import { inject, singleton } from 'tsyringe';

import { tryCatch } from '@kaeri/shared/helpers/std-utils';

import env from '@~/constants/env';
import { TOKENS } from '@~/di/tokens';

import type { iWithLogger, LoggerFactory, LoggerType } from '../logger/logger.types';

@singleton()
export class ValkeyService implements iWithLogger {
  public readonly logger: LoggerType;

  private client: Redis | Nil = null;

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('valkey');
  }

  public async connect() {
    if (this.client) return this.client;
    if (env.NODE_ENV === 'test') {
      this.logger.info('Valkey connection skipped in test environment');
      return null;
    }

    this.client = new Redis({
      host: env.VALKEY_HOST,
      port: env.VALKEY_PORT,
      username: env.VALKEY_USERNAME,
      password: env.VALKEY_PASSWORD,
      db: env.VALKEY_DB,
    });

    this.client.on('error', (error) => {
      this.logger.error('Valkey connection error', { error });
    });

    this.client.on('connect', () => {
      this.logger.info('Valkey connected');
    });

    await this.client.ping();
    return this.client;
  }

  public async disconnect() {
    if (!this.client) return;
    await this.client.quit();
    this.client = null;
  }

  /**
   * Get cached data by key
   * @param key Cache key
   * @returns Parsed data or null if not found
   */
  public async cacheGet<T>(key: string): Promise<T | Nil> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  /**
   * Set cached data with TTL
   * @param key Cache key
   * @param value Data to cache (will be JSON stringified)
   * @param ttlSeconds Time to live in seconds
   */
  public async cacheSet<T>(key: string, value: T, ttlSeconds: number) {
    if (!this.client) return;

    await tryCatch(async () => {
      await this.client?.setex(key, ttlSeconds, JSON.stringify(value));
    });
  }

  /**
   * Delete cached data by key
   * @param key Cache key
   */
  public async cacheDel(key: string) {
    if (!this.client) return;

    try {
      await this.client.del(key);
    } catch {
      /* Ignore errors */
    }
  }

  /**
   * Invalidate all keys matching a pattern
   * @param pattern Redis pattern (e.g., "series:*", "kb:{seriesId}:*")
   */
  public async invalidatePattern(pattern: string) {
    if (!this.client) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      /* Ignore errors */
    }
  }

  /**
   * Cache-aside pattern wrapper
   * Checks cache first, falls back to fetcher if miss, then populates cache
   * @param key Cache key
   * @param ttlSeconds Time to live in seconds
   * @param fetcher Function to fetch data on cache miss
   * @returns Cached or freshly fetched data
   */
  public async cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.cacheGet<T>(key);
    if (!isNil(cached)) return cached;

    const data = await fetcher();
    await this.cacheSet(key, data, ttlSeconds);
    return data;
  }
}

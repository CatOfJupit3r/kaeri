import type { DatabaseService } from '@~/db/database.service';
import type { AchievementsService } from '@~/features/achievements/achievements.service';
import type { AuthService } from '@~/features/auth/auth.service';
import type { BadgesService } from '@~/features/badges/badges.service';
import type { CanvasService } from '@~/features/canvas/canvas.service';
import type { ContinuityService } from '@~/features/continuity/continuity.service';
import type { TypedEventBus } from '@~/features/events/event-bus';
import type { ExportService } from '@~/features/export/export.service';
import type { KnowledgeBaseService } from '@~/features/knowledge-base/knowledge-base.service';
import type { LoggerFactory } from '@~/features/logger/logger.types';
import type { SceneService } from '@~/features/scenes/scene.service';
import type { ScriptsService } from '@~/features/scripts/scripts.service';
import type { SeriesService } from '@~/features/series/series.service';
import type { UserService } from '@~/features/user/user.service';
import type { CacheInvalidationService } from '@~/features/valkey/cache-invalidation.service';
import type { ValkeyService } from '@~/features/valkey/valkey.service';

const databaseServiceToken: unique symbol = Symbol.for('DatabaseService');
const authServiceToken: unique symbol = Symbol.for('AuthService');
const achievementsServiceToken: unique symbol = Symbol.for('AchievementsService');
const badgesServiceToken: unique symbol = Symbol.for('BadgesService');
const eventBusToken: unique symbol = Symbol.for('EventBus');
const userServiceToken: unique symbol = Symbol.for('UserService');
const loggerFactoryToken: unique symbol = Symbol.for('LoggerFactory');
const valkeyServiceToken: unique symbol = Symbol.for('ValkeyService');
const cacheInvalidationServiceToken: unique symbol = Symbol.for('CacheInvalidationService');
const seriesServiceToken: unique symbol = Symbol.for('SeriesService');
const scriptsServiceToken: unique symbol = Symbol.for('ScriptsService');
const sceneServiceToken: unique symbol = Symbol.for('SceneService');
const knowledgeBaseServiceToken: unique symbol = Symbol.for('KnowledgeBaseService');
const canvasServiceToken: unique symbol = Symbol.for('CanvasService');
const exportServiceToken: unique symbol = Symbol.for('ExportService');
const continuityServiceToken: unique symbol = Symbol.for('ContinuityService');

// Service tokens for dependency injection (unique symbols for type-safe lookups)
export const TOKENS = {
  DatabaseService: databaseServiceToken,
  AuthService: authServiceToken,
  AchievementsService: achievementsServiceToken,
  BadgesService: badgesServiceToken,
  EventBus: eventBusToken,
  UserService: userServiceToken,
  LoggerFactory: loggerFactoryToken,
  ValkeyService: valkeyServiceToken,
  CacheInvalidationService: cacheInvalidationServiceToken,
  SeriesService: seriesServiceToken,
  ScriptsService: scriptsServiceToken,
  SceneService: sceneServiceToken,
  KnowledgeBaseService: knowledgeBaseServiceToken,
  CanvasService: canvasServiceToken,
  ExportService: exportServiceToken,
  ContinuityService: continuityServiceToken,
} as const;

export interface iTokenRegistry {
  [TOKENS.DatabaseService]: DatabaseService;
  [TOKENS.AuthService]: AuthService;
  [TOKENS.AchievementsService]: AchievementsService;
  [TOKENS.BadgesService]: BadgesService;
  [TOKENS.EventBus]: TypedEventBus;
  [TOKENS.UserService]: UserService;
  [TOKENS.LoggerFactory]: LoggerFactory;
  [TOKENS.ValkeyService]: ValkeyService;
  [TOKENS.CacheInvalidationService]: CacheInvalidationService;
  [TOKENS.SeriesService]: SeriesService;
  [TOKENS.ScriptsService]: ScriptsService;
  [TOKENS.SceneService]: SceneService;
  [TOKENS.KnowledgeBaseService]: KnowledgeBaseService;
  [TOKENS.CanvasService]: CanvasService;
  [TOKENS.ExportService]: ExportService;
  [TOKENS.ContinuityService]: ContinuityService;
}

export type InjectionTokens = typeof TOKENS;

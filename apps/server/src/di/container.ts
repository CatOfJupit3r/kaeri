import 'reflect-metadata';
import { container, Lifecycle } from 'tsyringe';

import { TOKENS } from './tokens';
import type { iTokenRegistry } from './tokens';

export { container };

// Function to register all services in the container
export async function registerServices() {
  // Import services dynamically to avoid circular dependencies
  const { DatabaseService } = await import('@~/db/database.service');
  const { AuthService } = await import('@~/features/auth/auth.service');
  const { AchievementsService } = await import('@~/features/achievements/achievements.service');
  const { BadgesService } = await import('@~/features/badges/badges.service');
  const { UserService } = await import('@~/features/user/user.service');
  const { LoggerFactoryImpl } = await import('@~/features/logger/logger.factory');
  const { TypedEventBus } = await import('@~/features/events/event-bus');
  const { ValkeyService } = await import('@~/features/valkey/valkey.service');
  const { CacheInvalidationService } = await import('@~/features/valkey/cache-invalidation.service');
  const { SeriesService } = await import('@~/features/series/series.service');
  const { ScriptsService } = await import('@~/features/scripts/scripts.service');
  const { KnowledgeBaseService } = await import('@~/features/knowledge-base/knowledge-base.service');
  const { CanvasService } = await import('@~/features/canvas/canvas.service');
  const { ExportService } = await import('@~/features/export/export.service');
  const { ContinuityService } = await import('@~/features/continuity/continuity.service');
  const { ThemeService } = await import('@~/features/themes/theme.service');

  // Register singletons with their tokens
  container.registerSingleton(TOKENS.EventBus, TypedEventBus);
  container.registerSingleton(TOKENS.DatabaseService, DatabaseService);
  container.registerSingleton(TOKENS.AuthService, AuthService);
  container.registerSingleton(TOKENS.AchievementsService, AchievementsService);
  container.registerSingleton(TOKENS.BadgesService, BadgesService);
  container.registerSingleton(TOKENS.LoggerFactory, LoggerFactoryImpl);
  container.registerSingleton(TOKENS.ValkeyService, ValkeyService);
  container.registerSingleton(TOKENS.CacheInvalidationService, CacheInvalidationService);

  container.register(TOKENS.UserService, { useClass: UserService }, { lifecycle: Lifecycle.Transient });
  container.register(TOKENS.SeriesService, SeriesService, { lifecycle: Lifecycle.Transient });
  container.register(TOKENS.ScriptsService, ScriptsService, { lifecycle: Lifecycle.Transient });
  container.register(TOKENS.KnowledgeBaseService, KnowledgeBaseService, { lifecycle: Lifecycle.Transient });
  container.register(TOKENS.CanvasService, CanvasService, { lifecycle: Lifecycle.Transient });
  container.register(TOKENS.ExportService, ExportService, { lifecycle: Lifecycle.Transient });
  container.register(TOKENS.ContinuityService, ContinuityService, { lifecycle: Lifecycle.Transient });
  container.register(TOKENS.ThemeService, ThemeService, { lifecycle: Lifecycle.Transient });

  // Initialize services that need registration
  CacheInvalidationService.handleRegistration({ container, token: TOKENS.CacheInvalidationService });
}

// Helper function to resolve services
export function resolve<T extends keyof iTokenRegistry>(token: T): iTokenRegistry[T] {
  return container.resolve<iTokenRegistry[T]>(token);
}

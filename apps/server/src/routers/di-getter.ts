import { resolve } from '@~/di';
import { TOKENS } from '@~/di/tokens';

export const GETTERS = {
  AuthService: () => resolve(TOKENS.AuthService),
  AchievementsService: () => resolve(TOKENS.AchievementsService),
  BadgesService: () => resolve(TOKENS.BadgesService),
  UserService: () => resolve(TOKENS.UserService),
  DatabaseService: () => resolve(TOKENS.DatabaseService),
  EventBus: () => resolve(TOKENS.EventBus),
  SeriesService: () => resolve(TOKENS.SeriesService),
  ScriptsService: () => resolve(TOKENS.ScriptsService),
  KnowledgeBaseService: () => resolve(TOKENS.KnowledgeBaseService),
  CanvasService: () => resolve(TOKENS.CanvasService),
  ExportService: () => resolve(TOKENS.ExportService),
  ContinuityService: () => resolve(TOKENS.ContinuityService),
  ThemeService: () => resolve(TOKENS.ThemeService),
  StoryArcService: () => resolve(TOKENS.StoryArcService),
};

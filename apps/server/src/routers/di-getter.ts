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
  SceneService: () => resolve(TOKENS.SceneService),
  KnowledgeBaseService: () => resolve(TOKENS.KnowledgeBaseService),
  CanvasService: () => resolve(TOKENS.CanvasService),
  ExportService: () => resolve(TOKENS.ExportService),
  ContinuityService: () => resolve(TOKENS.ContinuityService),
  ThemeService: () => resolve(TOKENS.ThemeService),
  StoryArcService: () => resolve(TOKENS.StoryArcService),
  ScriptKBIntegrationService: () => resolve(TOKENS.ScriptKBIntegrationService),
  EpisodeService: () => resolve(TOKENS.EpisodeService),
  AuditService: () => resolve(TOKENS.AuditService),
  ResearchService: () => resolve(TOKENS.ResearchService),
  PermissionService: () => resolve(TOKENS.PermissionService),
  WorkspaceService: () => resolve(TOKENS.WorkspaceService),
  MemberService: () => resolve(TOKENS.MemberService),
  InvitationService: () => resolve(TOKENS.InvitationService),
  PresenceService: () => resolve(TOKENS.PresenceService),
};

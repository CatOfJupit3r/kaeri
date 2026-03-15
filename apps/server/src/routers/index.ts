import { achievementsRouter } from './achievements.router';
import { badgesRouter } from './badges.router';
import { canvasRouter } from './canvas.router';
import { continuityRouter } from './continuity.router';
import { episodeRouter } from './episode.router';
import { exportRouter } from './export.router';
import { indexRouter } from './index.router';
import { invitationRouter } from './invitation.router';
import { knowledgeBaseRouter } from './knowledge-base.router';
import { researchRouter } from './research.router';
import { sceneRouter } from './scene.router';
import { scriptKBIntegrationRouter } from './script-kb-integration.router';
import { scriptsRouter } from './scripts.router';
import { seriesRouter } from './series.router';
import { storyArcRouter } from './story-arc.router';
import { themeRouter } from './theme.router';
import { userRouter } from './user.router';
import { workspaceMemberRouter } from './workspace-member.router';
import { workspaceRouter } from './workspace.router';

/**
 * Composed app router from all contract groups.
 * Each router is created from its respective contract group base
 * to avoid TS7056 type serialization limits.
 */
export const appRouter = {
  // Core
  user: userRouter,
  index: indexRouter,
  // Series
  series: seriesRouter,
  episode: episodeRouter,
  storyArc: storyArcRouter,
  // Content
  scripts: scriptsRouter,
  scene: sceneRouter,
  // Knowledge
  knowledgeBase: knowledgeBaseRouter,
  scriptKBIntegration: scriptKBIntegrationRouter,
  research: researchRouter,
  // Features
  canvas: canvasRouter,
  continuity: continuityRouter,
  export: exportRouter,
  theme: themeRouter,
  // Gamification
  achievements: achievementsRouter,
  badges: badgesRouter,
  // Collaboration
  workspace: workspaceRouter,
  workspaceMember: workspaceMemberRouter,
  invitation: invitationRouter,
};

export type AppRouter = typeof appRouter;

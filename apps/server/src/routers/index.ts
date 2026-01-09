import { base } from '../lib/orpc';
import { achievementsRouter } from './achievements.router';
import { badgesRouter } from './badges.router';
import { canvasRouter } from './canvas.router';
import { continuityRouter } from './continuity.router';
import { exportRouter } from './export.router';
import { indexRouter } from './index.router';
import { knowledgeBaseRouter } from './knowledge-base.router';
import { scriptsRouter } from './scripts.router';
import { seriesRouter } from './series.router';
import { storyArcRouter } from './story-arc.router';
import { userRouter } from './user.router';

export const appRouter = base.router({
  user: userRouter,
  index: indexRouter,
  achievements: achievementsRouter,
  badges: badgesRouter,
  series: seriesRouter,
  scripts: scriptsRouter,
  knowledgeBase: knowledgeBaseRouter,
  canvas: canvasRouter,
  continuity: continuityRouter,
  export: exportRouter,
  storyArc: storyArcRouter,
});

export type AppRouter = typeof appRouter;

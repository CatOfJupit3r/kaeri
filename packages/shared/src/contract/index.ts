import achievementsContract from './achievements.contract';
import badgesContract from './badges.contract';
import canvasContract from './canvas.contract';
import continuityContract from './continuity.contract';
import exportContract from './export.contract';
import indexContract from './index.contract';
import knowledgeBaseContract from './knowledge-base.contract';
import scriptsContract from './scripts.contract';
import seriesContract from './series.contract';
import storyArcContract from './story-arc.contract';
import userContract from './user.contract';

export const CONTRACT = {
  user: userContract,
  index: indexContract,
  achievements: achievementsContract,
  badges: badgesContract,
  series: seriesContract,
  scripts: scriptsContract,
  knowledgeBase: knowledgeBaseContract,
  canvas: canvasContract,
  continuity: continuityContract,
  export: exportContract,
  storyArc: storyArcContract,
};

export type AppContract = typeof CONTRACT;

export default CONTRACT;

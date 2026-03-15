/**
 * Split oRPC bases for each contract group.
 * This avoids TypeScript TS7056 serialization limits by keeping
 * each type tree smaller.
 */
export { collaborationBase, collaborationProtected, collaborationPublic } from './collaboration';
export { contentBase, contentProtected, contentPublic } from './content';
export { coreBase, coreProtected, corePublic } from './core';
export { featuresBase, featuresProtected, featuresPublic } from './features';
export { gamificationBase, gamificationProtected, gamificationPublic } from './gamification';
export { kbBase, kbProtected, kbPublic } from './knowledge';
export { seriesBase, seriesProtected, seriesPublic } from './series';

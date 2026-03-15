/**
 * Contract groups for split type inference
 *
 * These are split to avoid TypeScript TS7056 error when the combined
 * contract type tree becomes too large for serialization.
 */
export { COLLABORATION_CONTRACT, type CollaborationContract } from './collaboration.contract';
export { CONTENT_CONTRACT, type ContentContract } from './content.contract';
export { CORE_CONTRACT, type CoreContract } from './core.contract';
export { FEATURES_CONTRACT, type FeaturesContract } from './features.contract';
export { GAMIFICATION_CONTRACT, type GamificationContract } from './gamification.contract';
export { KNOWLEDGE_CONTRACT, type KnowledgeContract } from './knowledge.contract';
export { SERIES_CONTRACT, type SeriesContract } from './series.contract';

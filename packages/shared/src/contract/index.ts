import { COLLABORATION_CONTRACT } from './groups/collaboration.contract';
import { CONTENT_CONTRACT } from './groups/content.contract';
import { CORE_CONTRACT } from './groups/core.contract';
import { FEATURES_CONTRACT } from './groups/features.contract';
import { GAMIFICATION_CONTRACT } from './groups/gamification.contract';
import { KNOWLEDGE_CONTRACT } from './groups/knowledge.contract';
import { SERIES_CONTRACT } from './groups/series.contract';

/**
 * Contract groups - split for TypeScript type serialization limits
 */
export * from './groups';

/**
 * Full contract - use only for client-side type inference.
 * Server-side should use individual contract groups to avoid TS7056.
 */
export const CONTRACT = {
  ...CORE_CONTRACT,
  ...SERIES_CONTRACT,
  ...CONTENT_CONTRACT,
  ...KNOWLEDGE_CONTRACT,
  ...FEATURES_CONTRACT,
  ...GAMIFICATION_CONTRACT,
  ...COLLABORATION_CONTRACT,
};

export type AppContract = typeof CONTRACT;

export default CONTRACT;

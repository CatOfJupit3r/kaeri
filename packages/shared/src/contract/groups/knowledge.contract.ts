/**
 * Knowledge contracts - knowledge base and research
 */
import knowledgeBaseContract from '../knowledge-base.contract';
import researchContract from '../research.contract';
import scriptKBIntegrationContract from '../script-kb-integration.contract';

export const KNOWLEDGE_CONTRACT = {
  knowledgeBase: knowledgeBaseContract,
  scriptKBIntegration: scriptKBIntegrationContract,
  research: researchContract,
};

export type KnowledgeContract = typeof KNOWLEDGE_CONTRACT;

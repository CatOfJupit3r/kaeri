import type { QueryClient, QueryKey } from '@tanstack/react-query';

import { PAGE_SIZES } from '@kaeri/shared';

export type KnowledgeBaseEntity = 'characters' | 'locations' | 'props' | 'timeline' | 'wildcards';

export const KB_LIST_DEFAULT_PARAMS = { limit: PAGE_SIZES.DEFAULT, offset: 0 } as const;
export const KB_COUNT_PARAMS = { limit: 1, offset: 0 } as const;

const isKnowledgeBaseListQuery = (queryKey: QueryKey, entity: KnowledgeBaseEntity, seriesId: string) => {
  if (!Array.isArray(queryKey)) return false;

  const serialized = JSON.stringify(queryKey);

  return serialized.includes('"knowledgeBase"') && serialized.includes(`"${entity}"`) && serialized.includes(seriesId);
};

export const invalidateKnowledgeBaseLists = async (
  client: QueryClient,
  entity: KnowledgeBaseEntity,
  seriesId: string,
) =>
  client.invalidateQueries({
    predicate: (query) => isKnowledgeBaseListQuery(query.queryKey, entity, seriesId),
  });

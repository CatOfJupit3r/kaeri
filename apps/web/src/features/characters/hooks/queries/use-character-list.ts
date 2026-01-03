import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type CharacterListQueryReturnType = ORPCOutputs['knowledgeBase']['characters']['list'];

export const characterListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.knowledgeBase.characters.list.queryOptions({
    input: { seriesId, limit: params.limit ?? 20, offset: params.offset ?? 0 },
  });

export function useCharacterList(seriesId: string, limit = 20, offset = 0, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...characterListQueryOptions(seriesId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

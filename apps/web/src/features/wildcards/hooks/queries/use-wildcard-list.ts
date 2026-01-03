import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

export type WildcardListQueryReturnType = ORPCOutputs['knowledgeBase']['wildcards']['list'];

export const wildcardListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.knowledgeBase.wildcards.list.queryOptions({
    input: {
      seriesId,
      limit: params.limit ?? KB_LIST_DEFAULT_PARAMS.limit,
      offset: params.offset ?? KB_LIST_DEFAULT_PARAMS.offset,
    },
  });

export function useWildcardList(seriesId: string, limit = 20, offset = 0, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...wildcardListQueryOptions(seriesId, { limit, offset }),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

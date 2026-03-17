import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { PAGE_SIZES } from '@kaeri/shared';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';

export type CharacterListQueryReturnType = ORPCOutputs['knowledgeBase']['characters']['list'];
export type CharacterListItem = CharacterListQueryReturnType['items'][number];

interface iPageParam {
  pageParam?: number;
}

/**
 * Standard query options for character list (single page)
 */
export const characterListQueryOptions = (seriesId: string, params: { limit?: number; offset?: number } = {}) =>
  tanstackRPC.knowledgeBase.characters.list.queryOptions({
    input: {
      seriesId,
      limit: params.limit ?? KB_LIST_DEFAULT_PARAMS.limit,
      offset: params.offset ?? KB_LIST_DEFAULT_PARAMS.offset,
    },
  });

/**
 * Infinite query options for character list (paginated with load more)
 */
export const characterListInfiniteOptions = (seriesId: string, pageSize: number = PAGE_SIZES.DEFAULT) =>
  tanstackRPC.knowledgeBase.characters.list.infiniteOptions({
    input: (context: iPageParam) => ({
      seriesId,
      limit: pageSize,
      offset: context.pageParam ?? 0,
    }),
    getNextPageParam: (
      lastPage: CharacterListQueryReturnType,
      allPages: CharacterListQueryReturnType[],
    ): iPageParam | undefined => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return totalFetched < lastPage.total ? { pageParam: totalFetched } : undefined;
    },
    initialPageParam: { pageParam: 0 },
  });

/**
 * Hook for infinite character list with load more
 */
export function useCharacterListInfinite(seriesId: string, options: { pageSize?: number; enabled?: boolean } = {}) {
  const { pageSize = PAGE_SIZES.DEFAULT, enabled: isEnabled = true } = options;

  const query = useInfiniteQuery({
    ...characterListInfiniteOptions(seriesId, pageSize),
    enabled: isEnabled && !!seriesId,
  });

  // Flatten pages into a single array of items
  const items = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.items);
  }, [query.data?.pages]);

  // Get total from the last page (most accurate)
  const total = query.data?.pages[query.data.pages.length - 1]?.total ?? 0;

  return {
    ...query,
    items,
    total,
    hasMore: items.length < total,
  };
}

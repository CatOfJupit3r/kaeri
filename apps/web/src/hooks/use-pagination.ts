import { parseAsInteger, useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

import { PAGE_SIZES } from '@kaeri/shared';

interface iUsePaginationOptions {
  /** Default page size */
  defaultPageSize?: number;
  /** Whether to persist pagination in URL */
  shouldPersistInUrl?: boolean;
}

interface iPaginationState {
  page: number;
  pageSize: number;
  offset: number;
}

interface iPaginationControls {
  /** Go to a specific page */
  setPage: (page: number) => void;
  /** Change the page size (resets to page 1) */
  setPageSize: (pageSize: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Reset to first page */
  reset: () => void;
}

interface iPaginationResult {
  /** Current pagination state */
  state: iPaginationState;
  /** Pagination controls */
  controls: iPaginationControls;
  /** Query params for API calls */
  queryParams: { limit: number; offset: number };
  /** Check if there are more pages based on total */
  hasMore: (total: number) => boolean;
  /** Calculate total pages based on total items */
  totalPages: (total: number) => number;
}

/**
 * Hook for managing pagination state.
 * Can optionally persist state in URL using nuqs.
 *
 * @example
 * ```tsx
 * function MyList() {
 *   const { state, controls, queryParams, hasMore } = usePagination();
 *   const { data } = useQuery({
 *     ...listQueryOptions(queryParams),
 *   });
 *
 *   return (
 *     <>
 *       <ItemList items={data.items} />
 *       <PaginationControls
 *         page={state.page}
 *         pageSize={state.pageSize}
 *         total={data.total}
 *         onPageChange={controls.setPage}
 *         onPageSizeChange={controls.setPageSize}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function usePagination(options: iUsePaginationOptions = {}): iPaginationResult {
  const { defaultPageSize = PAGE_SIZES.DEFAULT, shouldPersistInUrl = true } = options;

  const [urlState, setUrlState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(defaultPageSize),
  });

  const page = shouldPersistInUrl ? urlState.page : 1;
  const pageSize = shouldPersistInUrl ? urlState.pageSize : defaultPageSize;

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const setPage = useCallback(
    (newPage: number) => {
      if (shouldPersistInUrl) {
        void setUrlState({ page: newPage });
      }
    },
    [shouldPersistInUrl, setUrlState],
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      if (shouldPersistInUrl) {
        // Reset to page 1 when page size changes
        void setUrlState({ pageSize: newPageSize, page: 1 });
      }
    },
    [shouldPersistInUrl, setUrlState],
  );

  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

  const previousPage = useCallback(() => {
    setPage(Math.max(1, page - 1));
  }, [page, setPage]);

  const reset = useCallback(() => {
    if (shouldPersistInUrl) {
      void setUrlState({ page: 1, pageSize: defaultPageSize });
    }
  }, [shouldPersistInUrl, defaultPageSize, setUrlState]);

  const hasMore = useCallback((total: number) => page * pageSize < total, [page, pageSize]);

  const totalPages = useCallback((total: number) => Math.ceil(total / pageSize), [pageSize]);

  return {
    state: { page, pageSize, offset },
    controls: { setPage, setPageSize, nextPage, previousPage, reset },
    queryParams: { limit: pageSize, offset },
    hasMore,
    totalPages,
  };
}

interface iUseLoadMoreOptions {
  /** Initial page size */
  initialPageSize?: number;
}

interface iLoadMoreState {
  offset: number;
  limit: number;
}

interface iLoadMoreControls {
  /** Load more items */
  loadMore: () => void;
  /** Reset to initial state */
  reset: () => void;
}

interface iLoadMoreResult {
  /** Current state */
  state: iLoadMoreState;
  /** Controls */
  controls: iLoadMoreControls;
  /** Query params for API calls */
  queryParams: { limit: number; offset: number };
  /** Check if there are more items to load */
  hasMore: (total: number) => boolean;
}

/**
 * Hook for "Load More" pagination pattern.
 * Use this for infinite scroll or load-more buttons.
 * Does NOT persist in URL (for infinite lists, URL state doesn't make sense).
 *
 * @example
 * ```tsx
 * function MyInfiniteList() {
 *   const { state, controls, queryParams, hasMore } = useLoadMore();
 *   const { data } = useQuery({
 *     ...listQueryOptions(queryParams),
 *   });
 *
 *   return (
 *     <>
 *       <ItemList items={data.items} />
 *       <LoadMoreButton
 *         hasMore={hasMore(data.total)}
 *         onLoadMore={controls.loadMore}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useLoadMore(options: iUseLoadMoreOptions = {}): iLoadMoreResult {
  const { initialPageSize = PAGE_SIZES.DEFAULT } = options;

  const [state, setState] = useQueryStates(
    {
      offset: parseAsInteger.withDefault(0),
    },
    {
      // Don't persist in URL for load more
      history: 'replace',
    },
  );

  const { offset } = state;
  const limit = initialPageSize;

  const loadMore = useCallback(() => {
    void setState({ offset: offset + limit });
  }, [offset, limit, setState]);

  const reset = useCallback(() => {
    void setState({ offset: 0 });
  }, [setState]);

  const hasMore = useCallback((total: number) => offset + limit < total, [offset, limit]);

  return {
    state: { offset, limit },
    controls: { loadMore, reset },
    queryParams: { limit, offset },
    hasMore,
  };
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  AutocompleteEntityType,
  AutocompleteSuggestion,
} from '@kaeri/shared/contract/script-kb-integration.contract';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type AutocompleteSearchReturnType = ORPCOutputs['scriptKBIntegration']['autocompleteSearch'];

export interface iUseEntitySuggestionsOptions {
  seriesId: string;
  entityType: AutocompleteEntityType;
  query: string;
  limit?: number;
  /** IDs of recently used entities for prioritization */
  recentlyUsed?: string[];
  /** Script context for smarter suggestions */
  scriptId?: string;
  /** Block type context */
  blockType?: string;
  /** Enable/disable the query */
  enabled?: boolean;
  /** Debounce delay in ms (default: 150) */
  debounceMs?: number;
}

// Type alias for external use
export type UseEntitySuggestionsOptions = iUseEntitySuggestionsOptions;

export interface iUseEntitySuggestionsReturn {
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
  error: Error | null;
  /** Query timing from server */
  timing?: { queryMs: number; totalMs: number };
  /** Refetch suggestions */
  refetch: () => void;
}

// Type alias for external use
export type UseEntitySuggestionsReturn = iUseEntitySuggestionsReturn;

/**
 * Type alias for specialized suggestion hook options
 * Used by useCharacterSuggestions, useLocationSuggestions, etc.
 */
export type SpecializedSuggestionOptions = Partial<
  Omit<iUseEntitySuggestionsOptions, 'seriesId' | 'entityType' | 'query'>
>;

/**
 * Debounce value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for fetching entity suggestions with debounce and caching
 */
export function useEntitySuggestions(options: iUseEntitySuggestionsOptions): iUseEntitySuggestionsReturn {
  const {
    seriesId,
    entityType,
    query,
    limit = 5,
    recentlyUsed,
    scriptId,
    blockType,
    enabled: isEnabled = true,
    debounceMs = 150,
  } = options;

  const queryClient = useQueryClient();

  // Debounce the search query
  const debouncedQuery = useDebounce(query, debounceMs);

  // Build query options
  const queryOptions = useMemo(
    () =>
      tanstackRPC.scriptKBIntegration.autocompleteSearch.queryOptions({
        input: {
          seriesId,
          entityType,
          query: debouncedQuery,
          limit,
          context: {
            scriptId,
            blockType,
            recentlyUsed,
          },
        },
      }),
    [seriesId, entityType, debouncedQuery, limit, scriptId, blockType, recentlyUsed],
  );

  // Execute query
  const { data, isLoading, error, refetch } = useQuery({
    ...queryOptions,
    // Enable query even with empty string - show all entities when trigger is typed
    enabled: isEnabled && !!seriesId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Callback for manual refetch
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Prefetch on mount for common queries
  useEffect(() => {
    if (seriesId && isEnabled) {
      // Prefetch empty query to get all entities
      void queryClient.prefetchQuery(
        tanstackRPC.scriptKBIntegration.autocompleteSearch.queryOptions({
          input: {
            seriesId,
            entityType,
            query: '',
            limit: 10,
          },
        }),
      );
    }
  }, [seriesId, entityType, isEnabled, queryClient]);

  return {
    suggestions: data?.items ?? [],
    isLoading,
    error,
    timing: data?.timing,
    refetch: handleRefetch,
  };
}

/**
 * Specialized hook for character suggestions
 */
export function useCharacterSuggestions(
  seriesId: string,
  query: string,
  options?: SpecializedSuggestionOptions,
): iUseEntitySuggestionsReturn {
  return useEntitySuggestions({
    seriesId,
    entityType: 'character',
    query,
    ...options,
  });
}

/**
 * Specialized hook for location suggestions
 */
export function useLocationSuggestions(
  seriesId: string,
  query: string,
  options?: SpecializedSuggestionOptions,
): iUseEntitySuggestionsReturn {
  return useEntitySuggestions({
    seriesId,
    entityType: 'location',
    query,
    ...options,
  });
}

/**
 * Specialized hook for prop suggestions
 */
export function usePropSuggestions(
  seriesId: string,
  query: string,
  options?: SpecializedSuggestionOptions,
): iUseEntitySuggestionsReturn {
  return useEntitySuggestions({
    seriesId,
    entityType: 'prop',
    query,
    ...options,
  });
}

/**
 * Specialized hook for wildcard suggestions
 */
export function useWildcardSuggestions(
  seriesId: string,
  query: string,
  options?: SpecializedSuggestionOptions,
): iUseEntitySuggestionsReturn {
  return useEntitySuggestions({
    seriesId,
    entityType: 'wildcard',
    query,
    ...options,
  });
}

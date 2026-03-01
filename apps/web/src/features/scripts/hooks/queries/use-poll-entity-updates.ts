import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { useApplyEntityUpdate, useSetSyncStatus } from '../../stores';

export type PollUpdatesReturnType = ORPCOutputs['scriptKBIntegration']['pollEntityUpdates'];

export interface iUsePollEntityUpdatesOptions {
  /** Series ID to poll updates for */
  seriesId: string;
  /** Whether polling is enabled */
  enabled?: boolean;
  /** Entity types to filter (optional) */
  entityTypes?: Array<'character' | 'location' | 'prop' | 'wildcard' | 'theme' | 'storyArc'>;
  /** Timeout for long-poll requests (ms) */
  timeout?: number;
  /** Callback when updates are received */
  onUpdates?: (updates: PollUpdatesReturnType['updates']) => void;
}

// Type alias for external use
export type UsePollEntityUpdatesOptions = iUsePollEntityUpdatesOptions;

/**
 * Hook for polling entity updates from the server.
 *
 * Implements long-polling with automatic reconnection.
 * When WebSocket collaboration is implemented, this hook will be
 * updated to use WebSocket push instead.
 *
 * @example
 * ```tsx
 * // Start polling for entity updates
 * const { isPolling, lastVersion, error } = usePollEntityUpdates({
 *   seriesId,
 *   enabled: isEditorActive,
 *   entityTypes: ['character', 'prop'],
 *   onUpdates: (updates) => {
 *     console.log('Received updates:', updates);
 *   },
 * });
 * ```
 */
export function usePollEntityUpdates({
  seriesId,
  enabled = true,
  entityTypes,
  timeout = 15000,
  onUpdates,
}: iUsePollEntityUpdatesOptions) {
  const queryClient = useQueryClient();
  const applyEntityUpdate = useApplyEntityUpdate();
  const setSyncStatus = useSetSyncStatus();

  // Track the current version for continuous polling
  const versionRef = useRef(0);
  const isPollingRef = useRef(false);

  // Query options for long-polling
  const queryOptions = {
    ...tanstackRPC.scriptKBIntegration.pollEntityUpdates.queryOptions({
      input: {
        seriesId,
        sinceVersion: versionRef.current,
        entityTypes,
        timeout,
      },
    }),
    enabled: enabled && !!seriesId,
    // Don't cache poll results
    staleTime: 0,
    gcTime: 0,
    // Retry on failure with backoff
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus could cause duplicate updates
    refetchOnWindowFocus: false,
    // Don't refetch on mount - we control polling manually
    refetchOnMount: false,
  };

  const query = useQuery(queryOptions);

  // Process updates when received
  const processUpdates = useCallback(
    (data: PollUpdatesReturnType) => {
      if (data.updates.length > 0) {
        // Apply each update to the entity cache
        for (const update of data.updates) {
          applyEntityUpdate(update);
        }

        // Call the callback if provided
        onUpdates?.(data.updates);
      }

      // Update version for next poll
      versionRef.current = data.currentVersion;

      // Update sync status to connected
      setSyncStatus('connected');
    },
    [applyEntityUpdate, onUpdates, setSyncStatus],
  );

  // Handle query results
  useEffect(() => {
    if (query.data) {
      processUpdates(query.data);

      // If there are more updates, trigger another poll immediately
      if (query.data.hasMore && enabled) {
        void queryClient.invalidateQueries({
          queryKey: tanstackRPC.scriptKBIntegration.pollEntityUpdates.queryKey({
            input: { seriesId, sinceVersion: versionRef.current },
          }),
        });
      }
    }
  }, [query.data, processUpdates, enabled, queryClient, seriesId]);

  // Handle errors - set reconnecting status
  useEffect(() => {
    if (query.error) {
      setSyncStatus('reconnecting');
    }
  }, [query.error, setSyncStatus]);

  // Manual poll trigger
  const triggerPoll = useCallback(() => {
    if (!isPollingRef.current && enabled) {
      void queryClient.invalidateQueries({
        queryKey: tanstackRPC.scriptKBIntegration.pollEntityUpdates.queryKey({
          input: { seriesId, sinceVersion: versionRef.current },
        }),
      });
    }
  }, [queryClient, enabled, seriesId]);

  // Reset version counter
  const resetVersion = useCallback(() => {
    versionRef.current = 0;
  }, []);

  return {
    isPolling: query.isFetching,
    lastVersion: versionRef.current,
    error: query.error,
    triggerPoll,
    resetVersion,
  };
}

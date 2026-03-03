import { useCallback, useEffect, useRef } from 'react';

import type { EntityLinkRef, SyncStatus } from '../stores';
import {
  useAddLink,
  useEntityCache,
  useIsLinksDirty,
  useMarkOrphaned,
  useRemoveLink,
  useScriptLinks,
  useSyncStatus,
} from '../stores';
import type { PollUpdatesReturnType } from './queries/use-poll-entity-updates';
import { usePollEntityUpdates } from './queries/use-poll-entity-updates';
import { useValidateEntityLinks } from './queries/use-validate-entity-links';

export interface iUseEntitySyncOptions {
  /** Script ID for tracking links */
  scriptId: string;
  /** Series ID for fetching entities */
  seriesId: string;
  /** Currently active block ID (for tracking links) */
  activeBlockId?: string;
  /** Whether sync is enabled */
  enabled?: boolean;
  /** Entity types to sync */
  entityTypes?: Array<'character' | 'location' | 'prop' | 'wildcard' | 'theme' | 'storyArc'>;
  /** Callback when sync connection state changes */
  onSyncStatusChange?: (status: SyncStatus) => void;
  /** Callback when entity links become orphaned */
  onOrphanedLinks?: (orphanedIds: string[]) => void;
}

export interface iUseEntitySyncResult {
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Whether there are unsaved changes (dirty state) */
  isDirty: boolean;
  /** Entity cache state */
  entityCache: ReturnType<typeof useEntityCache>;
  /** Add an entity link for the current block */
  addLink: (link: EntityLinkRef) => void;
  /** Remove an entity link */
  removeLink: (blockId: string, entityId: string) => void;
  /** Current script links state */
  linksState: ReturnType<typeof useScriptLinks>;
  /** Orphaned entity IDs (entities that no longer exist) */
  orphanedIds: Set<string>;
  /** Validate entity links against the server */
  validateLinks: (links: Array<{ entityType: string; entityId: string }>) => void;
  /** Manually trigger a sync poll */
  triggerSync: () => void;
  /** Whether currently syncing */
  isSyncing: boolean;
}

// Type aliases for external use
export type UseEntitySyncOptions = iUseEntitySyncOptions;
export type UseEntitySyncResult = iUseEntitySyncResult;

/**
 * Unified hook for managing entity synchronization in the script editor.
 *
 * Combines polling, validation, and cache management into a single API.
 * Handles:
 * - Polling for entity updates from the server
 * - Validating entity links exist
 * - Tracking which entities are referenced in which blocks
 * - Managing orphaned entity detection
 *
 * @example
 * ```tsx
 * const {
 *   syncStatus,
 *   isDirty,
 *   addLink,
 *   removeLink,
 *   orphanedIds,
 *   triggerSync,
 * } = useEntitySync({
 *   scriptId: script._id,
 *   seriesId: script.seriesId,
 *   activeBlockId: currentBlockId,
 * });
 *
 * // Check sync status
 * if (syncStatus === 'offline') {
 *   showOfflineWarning();
 * }
 *
 * // Add a link when entity is mentioned
 * addLink({
 *   blockId: currentBlockId,
 *   entityId: characterId,
 *   entityType: 'character',
 *   linkType: 'mention',
 * });
 *
 * // Check for orphaned references
 * if (orphanedIds.size > 0) {
 *   highlightOrphanedMentions(orphanedIds);
 * }
 * ```
 */
export function useEntitySync({
  seriesId,
  enabled = true,
  entityTypes,
  onSyncStatusChange,
  onOrphanedLinks,
}: iUseEntitySyncOptions): iUseEntitySyncResult {
  // Store hooks
  const entityCache = useEntityCache();
  const syncStatus = useSyncStatus();
  const isDirty = useIsLinksDirty();
  const scriptLinks = useScriptLinks();
  const addLinkAction = useAddLink();
  const removeLinkAction = useRemoveLink();
  const markOrphaned = useMarkOrphaned();

  // Validation mutation
  const { validateLinks: validateLinksMutation, data: validationData } = useValidateEntityLinks();

  // Track if we've processed the validation data
  const processedValidationRef = useRef<string | null>(null);

  // Handle entity updates from polling
  const handlePollUpdates = useCallback(
    (updates: PollUpdatesReturnType['updates']) => {
      // Check if any updates indicate deletion
      const deletedIds: string[] = [];
      for (const update of updates) {
        if (update.action === 'deleted') {
          deletedIds.push(update.entityId);
        }
      }

      if (deletedIds.length > 0) {
        markOrphaned(deletedIds);
        onOrphanedLinks?.(deletedIds);
      }
    },
    [markOrphaned, onOrphanedLinks],
  );

  // Poll for entity updates
  const { isPolling, triggerPoll } = usePollEntityUpdates({
    seriesId,
    enabled: enabled && !!seriesId,
    entityTypes,
    onUpdates: handlePollUpdates,
  });

  // Process validation results to mark orphaned entities
  useEffect(() => {
    if (validationData?.orphaned && validationData.orphaned.length > 0) {
      const orphanedKey = validationData.orphaned.join(',');
      if (processedValidationRef.current !== orphanedKey) {
        processedValidationRef.current = orphanedKey;
        markOrphaned(validationData.orphaned);
        onOrphanedLinks?.(validationData.orphaned);
      }
    }
  }, [validationData, markOrphaned, onOrphanedLinks]);

  // Notify when sync status changes
  useEffect(() => {
    onSyncStatusChange?.(syncStatus);
  }, [syncStatus, onSyncStatusChange]);

  // Wrapped addLink
  const addLink = useCallback(
    (link: EntityLinkRef) => {
      addLinkAction(link);
    },
    [addLinkAction],
  );

  // Wrapped removeLink
  const removeLink = useCallback(
    (blockId: string, entityId: string) => {
      removeLinkAction({ blockId, entityId });
    },
    [removeLinkAction],
  );

  // Validate links wrapper
  const validateLinks = useCallback(
    (links: Array<{ entityType: string; entityId: string }>) => {
      validateLinksMutation({ seriesId, links });
    },
    [validateLinksMutation, seriesId],
  );

  return {
    syncStatus,
    isDirty,
    entityCache,
    addLink,
    removeLink,
    linksState: scriptLinks,
    orphanedIds: scriptLinks.orphanedLinks,
    validateLinks,
    triggerSync: triggerPoll,
    isSyncing: isPolling,
  };
}

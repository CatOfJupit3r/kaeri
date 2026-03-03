import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

import type { AutocompleteSuggestion, EntitySyncUpdate } from '@kaeri/shared/contract/script-kb-integration.contract';

import type { EntityType } from '../extensions/entity-mention';

// ============================================================================
// Types
// ============================================================================

export interface iEntityCacheEntry extends AutocompleteSuggestion {
  /** Last update timestamp */
  lastUpdated: number;
  /** Version for conflict resolution */
  version?: number;
}

export interface iPendingMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: EntityType;
  entityId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export type SyncStatus = 'connected' | 'reconnecting' | 'offline';

export interface iEntityCacheState {
  /** Cached entities by type and ID */
  entities: Map<EntityType, Map<string, iEntityCacheEntry>>;
  /** Pending mutations not yet synced */
  pendingMutations: Map<string, iPendingMutation>;
  /** Last known sync version from server */
  lastSyncVersion: number;
  /** Current sync connection status */
  syncStatus: SyncStatus;
}

// Type aliases for external use
export type EntityCacheEntry = iEntityCacheEntry;
export type PendingMutation = iPendingMutation;
export type EntityCacheState = iEntityCacheState;

// ============================================================================
// Initial State
// ============================================================================

const initialState: iEntityCacheState = {
  entities: new Map([
    ['character', new Map()],
    ['prop', new Map()],
    ['wildcard', new Map()],
  ]),
  pendingMutations: new Map(),
  lastSyncVersion: 0,
  syncStatus: 'connected',
};

// ============================================================================
// Atoms
// ============================================================================

/** Main entity cache atom */
export const entityCacheAtom = atom<iEntityCacheState>(initialState);

/** Derived atom for characters only */
export const charactersAtom = atom((get) => {
  const cache = get(entityCacheAtom);
  return cache.entities.get('character') ?? new Map<string, iEntityCacheEntry>();
});

/** Derived atom for props only */
export const propsAtom = atom((get) => {
  const cache = get(entityCacheAtom);
  return cache.entities.get('prop') ?? new Map<string, iEntityCacheEntry>();
});

/** Derived atom for wildcards only */
export const wildcardsAtom = atom((get) => {
  const cache = get(entityCacheAtom);
  return cache.entities.get('wildcard') ?? new Map<string, iEntityCacheEntry>();
});

/** Derived atom for sync status */
export const syncStatusAtom = atom((get) => get(entityCacheAtom).syncStatus);

/** Derived atom for pending mutations count */
export const pendingMutationCountAtom = atom((get) => get(entityCacheAtom).pendingMutations.size);

// ============================================================================
// Actions
// ============================================================================

/**
 * Action atom to update entities from autocomplete results
 */
export const updateEntitiesFromSuggestionsAtom = atom(
  null,
  (get, set, { entityType, suggestions }: { entityType: EntityType; suggestions: AutocompleteSuggestion[] }) => {
    const cache = get(entityCacheAtom);
    const typeMap = new Map(cache.entities.get(entityType) ?? []);

    for (const suggestion of suggestions) {
      typeMap.set(suggestion._id, {
        ...suggestion,
        lastUpdated: Date.now(),
      });
    }

    const newEntities = new Map(cache.entities);
    newEntities.set(entityType, typeMap);

    set(entityCacheAtom, {
      ...cache,
      entities: newEntities,
    });
  },
);

/**
 * Action atom to apply a sync event from the server
 */
export const applyEntityUpdateAtom = atom(null, (get, set, update: EntitySyncUpdate) => {
  const cache = get(entityCacheAtom);
  const entityType = update.entityType as EntityType;

  const trackedType = cache.entities.get(entityType);
  // Skip if not a tracked entity type
  if (!trackedType) return;

  const typeMap = new Map(trackedType);

  switch (update.action) {
    case 'created':
    case 'updated': {
      const existing = typeMap.get(update.entityId);
      // Only apply if version is newer
      if (!existing?.version || existing.version < update.version) {
        typeMap.set(update.entityId, {
          _id: update.entityId,
          name: (update.patch?.name as string) ?? existing?.name ?? 'Unknown',
          avatarUrl: (update.patch?.avatarUrl as string) ?? existing?.avatarUrl,
          preview: (update.patch?.preview as string) ?? existing?.preview,
          lastUpdated: update.timestamp.getTime(),
          version: update.version,
        });
      }
      break;
    }
    case 'deleted': {
      typeMap.delete(update.entityId);
      break;
    }
    default:
      return;
  }

  const newEntities = new Map(cache.entities);
  newEntities.set(entityType, typeMap);

  set(entityCacheAtom, {
    ...cache,
    entities: newEntities,
    lastSyncVersion: Math.max(cache.lastSyncVersion, update.version),
  });
});

/**
 * Action atom to queue a pending mutation
 */
export const queueMutationAtom = atom(null, (get, set, mutation: Omit<iPendingMutation, 'id' | 'timestamp'>) => {
  const cache = get(entityCacheAtom);
  const id = `${mutation.entityType}-${mutation.entityId}-${Date.now()}`;

  const newPending = new Map(cache.pendingMutations);
  newPending.set(id, {
    ...mutation,
    id,
    timestamp: Date.now(),
  });

  set(entityCacheAtom, {
    ...cache,
    pendingMutations: newPending,
  });

  return id;
});

/**
 * Action atom to reconcile a pending mutation (remove on success/failure)
 */
export const reconcileMutationAtom = atom(null, (get, set, mutationId: string) => {
  const cache = get(entityCacheAtom);
  const newPending = new Map(cache.pendingMutations);
  newPending.delete(mutationId);

  set(entityCacheAtom, {
    ...cache,
    pendingMutations: newPending,
  });
});

/**
 * Action atom to update sync status
 */
export const setSyncStatusAtom = atom(null, (get, set, status: SyncStatus) => {
  const cache = get(entityCacheAtom);
  set(entityCacheAtom, {
    ...cache,
    syncStatus: status,
  });
});

/**
 * Action atom to get an entity by ID
 */
export const getEntityAtom = atom(
  null,
  (get, _set, { entityType, entityId }: { entityType: EntityType; entityId: string }) => {
    const cache = get(entityCacheAtom);
    return cache.entities.get(entityType)?.get(entityId);
  },
);

/**
 * Action atom to clear cache for a specific entity type
 */
export const clearEntityTypeCacheAtom = atom(null, (get, set, entityType: EntityType) => {
  const cache = get(entityCacheAtom);
  const newEntities = new Map(cache.entities);
  newEntities.set(entityType, new Map());

  set(entityCacheAtom, {
    ...cache,
    entities: newEntities,
  });
});

/**
 * Action atom to reset entire cache
 */
export const resetEntityCacheAtom = atom(null, (_get, set) => {
  set(entityCacheAtom, initialState);
});

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to read the full entity cache state
 */
export function useEntityCache() {
  return useAtomValue(entityCacheAtom);
}

/**
 * Hook to read and write entity cache
 */
export function useEntityCacheState() {
  return useAtom(entityCacheAtom);
}

/**
 * Hook to get entities by type
 */
export function useEntitiesByType(entityType: EntityType) {
  const cache = useAtomValue(entityCacheAtom);
  return cache.entities.get(entityType) ?? new Map<string, iEntityCacheEntry>();
}

/**
 * Hook to update entities from suggestions
 */
export function useUpdateEntitiesFromSuggestions() {
  return useSetAtom(updateEntitiesFromSuggestionsAtom);
}

/**
 * Hook to apply entity updates from sync
 */
export function useApplyEntityUpdate() {
  return useSetAtom(applyEntityUpdateAtom);
}

/**
 * Hook to queue mutations
 */
export function useQueueMutation() {
  return useSetAtom(queueMutationAtom);
}

/**
 * Hook to reconcile mutations
 */
export function useReconcileMutation() {
  return useSetAtom(reconcileMutationAtom);
}

/**
 * Hook to set sync status
 */
export function useSetSyncStatus() {
  return useSetAtom(setSyncStatusAtom);
}

/**
 * Hook to get sync status
 */
export function useSyncStatus() {
  return useAtomValue(syncStatusAtom);
}

/**
 * Hook to get pending mutation count
 */
export function usePendingMutationCount() {
  return useAtomValue(pendingMutationCountAtom);
}

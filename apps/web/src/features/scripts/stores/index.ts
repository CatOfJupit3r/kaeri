// Entity cache for instant autocomplete and sync
export {
  // Types
  type EntityCacheEntry,
  type PendingMutation,
  type EntityCacheState,
  type SyncStatus,
  // Atoms
  entityCacheAtom,
  charactersAtom,
  propsAtom,
  wildcardsAtom,
  syncStatusAtom,
  pendingMutationCountAtom,
  // Action atoms
  updateEntitiesFromSuggestionsAtom,
  applyEntityUpdateAtom,
  queueMutationAtom,
  reconcileMutationAtom,
  setSyncStatusAtom,
  getEntityAtom,
  clearEntityTypeCacheAtom,
  resetEntityCacheAtom,
  // Hooks
  useEntityCache,
  useEntityCacheState,
  useEntitiesByType,
  useUpdateEntitiesFromSuggestions,
  useApplyEntityUpdate,
  useQueueMutation,
  useReconcileMutation,
  useSetSyncStatus,
  useSyncStatus,
  usePendingMutationCount,
} from './entity-cache.store';

// Script-entity link tracking
export {
  // Types
  type EntityLinkRef,
  type ScriptLinksState,
  // Atoms
  scriptLinksAtom,
  allLinksAtom,
  linksByEntityTypeAtom,
  uniqueEntityIdsByTypeAtom,
  orphanedLinksCountAtom,
  isLinksDirtyAtom,
  // Action atoms
  initializeScriptLinksAtom,
  addLinkAtom,
  removeLinkAtom,
  removeBlockLinksAtom,
  markOrphanedAtom,
  clearOrphanedAtom,
  markLinksSavedAtom,
  clearAllLinksAtom,
  getBlockLinksAtom,
  getEntityLinksAtom,
  isEntityOrphanedAtom,
  // Hooks
  useScriptLinks,
  useScriptLinksState,
  useAllLinks,
  useLinksByEntityType,
  useUniqueEntityIdsByType,
  useInitializeScriptLinks,
  useAddLink,
  useRemoveLink,
  useRemoveBlockLinks,
  useMarkOrphaned,
  useClearOrphaned,
  useMarkLinksSaved,
  useOrphanedLinksCount,
  useIsLinksDirty,
} from './script-links.store';

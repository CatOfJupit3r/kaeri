import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

import type { LinkType } from '@kaeri/shared/contract/script-kb-integration.contract';

import type { EntityType } from '../extensions/entity-mention';

// ============================================================================
// Types
// ============================================================================

export interface iEntityLinkRef {
  /** Block/node ID where the link exists */
  blockId: string;
  /** Type of entity being linked */
  entityType: EntityType | 'location' | 'scene' | 'timeline' | 'storyArc' | 'theme';
  /** Entity ID from the KB */
  entityId: string;
  /** Type of link (primary=main reference, mention=@mention, reference=!ref) */
  linkType: LinkType;
  /** Position within the block (for mentions) */
  position?: { start: number; end: number };
  /** Entity name for display (cached for orphan handling) */
  entityName?: string;
}

export interface iScriptLinksState {
  /** Current script ID */
  scriptId: string | null;
  /** All links in the script, keyed by blockId */
  links: Map<string, iEntityLinkRef[]>;
  /** Set of orphaned entity IDs (entities that no longer exist) */
  orphanedLinks: Set<string>;
  /** Entity IDs that were recently linked (for UI feedback) */
  recentlyLinked: Set<string>;
  /** Whether the links have been modified since last save */
  isDirty: boolean;
}

// Type aliases for external use
export type EntityLinkRef = iEntityLinkRef;
export type ScriptLinksState = iScriptLinksState;

// ============================================================================
// Initial State
// ============================================================================

const initialState: iScriptLinksState = {
  scriptId: null,
  links: new Map(),
  orphanedLinks: new Set(),
  recentlyLinked: new Set(),
  isDirty: false,
};

// ============================================================================
// Atoms
// ============================================================================

/** Main script links atom */
export const scriptLinksAtom = atom<iScriptLinksState>(initialState);

/** Derived atom for all links as flat array */
export const allLinksAtom = atom((get) => {
  const state = get(scriptLinksAtom);
  const allLinks: iEntityLinkRef[] = [];
  for (const links of state.links.values()) {
    allLinks.push(...links);
  }
  return allLinks;
});

/** Derived atom for links by entity type */
export const linksByEntityTypeAtom = atom((get) => {
  const allLinks = get(allLinksAtom);
  const byType = new Map<string, iEntityLinkRef[]>();

  for (const link of allLinks) {
    const existing = byType.get(link.entityType) ?? [];
    existing.push(link);
    byType.set(link.entityType, existing);
  }

  return byType;
});

/** Derived atom for unique entity IDs by type */
export const uniqueEntityIdsByTypeAtom = atom((get) => {
  const byType = get(linksByEntityTypeAtom);
  const result = new Map<string, Set<string>>();

  for (const [type, links] of byType) {
    result.set(type, new Set(links.map((l) => l.entityId)));
  }

  return result;
});

/** Derived atom for orphaned links count */
export const orphanedLinksCountAtom = atom((get) => get(scriptLinksAtom).orphanedLinks.size);

/** Derived atom for dirty state */
export const isLinksDirtyAtom = atom((get) => get(scriptLinksAtom).isDirty);

// ============================================================================
// Actions
// ============================================================================

/**
 * Initialize links for a script
 */
export const initializeScriptLinksAtom = atom(
  null,
  (get, set, { scriptId, links }: { scriptId: string; links: iEntityLinkRef[] }) => {
    const linksMap = new Map<string, iEntityLinkRef[]>();

    for (const link of links) {
      const existing = linksMap.get(link.blockId) ?? [];
      existing.push(link);
      linksMap.set(link.blockId, existing);
    }

    set(scriptLinksAtom, {
      scriptId,
      links: linksMap,
      orphanedLinks: new Set<string>(),
      recentlyLinked: new Set<string>(),
      isDirty: false,
    });
  },
);

/**
 * Add a link to a block
 */
export const addLinkAtom = atom(null, (get, set, link: iEntityLinkRef) => {
  const state = get(scriptLinksAtom);
  const blockLinks = [...(state.links.get(link.blockId) ?? [])];

  // Check if link already exists
  const existingIndex = blockLinks.findIndex((l) => l.entityId === link.entityId && l.linkType === link.linkType);

  if (existingIndex >= 0) {
    // Update existing link
    blockLinks[existingIndex] = link;
  } else {
    // Add new link
    blockLinks.push(link);
  }

  const newLinks = new Map(state.links);
  newLinks.set(link.blockId, blockLinks);

  const newRecentlyLinked = new Set(state.recentlyLinked);
  newRecentlyLinked.add(link.entityId);

  // Clear recently linked after a delay
  setTimeout(() => {
    const currentState = get(scriptLinksAtom);
    const updated = new Set(currentState.recentlyLinked);
    updated.delete(link.entityId);
    set(scriptLinksAtom, { ...currentState, recentlyLinked: updated });
  }, 2000);

  set(scriptLinksAtom, {
    ...state,
    links: newLinks,
    recentlyLinked: newRecentlyLinked,
    isDirty: true,
  });
});

/**
 * Remove a specific link
 */
export const removeLinkAtom = atom(null, (get, set, { blockId, entityId }: { blockId: string; entityId: string }) => {
  const state = get(scriptLinksAtom);
  const blockLinks = state.links.get(blockId);

  if (!blockLinks) return;

  const filtered = blockLinks.filter((l) => l.entityId !== entityId);
  const newLinks = new Map(state.links);

  if (filtered.length === 0) {
    newLinks.delete(blockId);
  } else {
    newLinks.set(blockId, filtered);
  }

  set(scriptLinksAtom, {
    ...state,
    links: newLinks,
    isDirty: true,
  });
});

/**
 * Remove all links for a block
 */
export const removeBlockLinksAtom = atom(null, (get, set, blockId: string) => {
  const state = get(scriptLinksAtom);
  const newLinks = new Map(state.links);
  newLinks.delete(blockId);

  set(scriptLinksAtom, {
    ...state,
    links: newLinks,
    isDirty: true,
  });
});

/**
 * Mark entity IDs as orphaned
 */
export const markOrphanedAtom = atom(null, (get, set, entityIds: string[]) => {
  const state = get(scriptLinksAtom);
  const newOrphaned = new Set(state.orphanedLinks);

  for (const id of entityIds) {
    newOrphaned.add(id);
  }

  set(scriptLinksAtom, {
    ...state,
    orphanedLinks: newOrphaned,
  });
});

/**
 * Clear orphaned status for entity IDs
 */
export const clearOrphanedAtom = atom(null, (get, set, entityIds: string[]) => {
  const state = get(scriptLinksAtom);
  const newOrphaned = new Set(state.orphanedLinks);

  for (const id of entityIds) {
    newOrphaned.delete(id);
  }

  set(scriptLinksAtom, {
    ...state,
    orphanedLinks: newOrphaned,
  });
});

/**
 * Mark links as saved (clear dirty flag)
 */
export const markLinksSavedAtom = atom(null, (get, set) => {
  const state = get(scriptLinksAtom);
  set(scriptLinksAtom, {
    ...state,
    isDirty: false,
  });
});

/**
 * Clear all links (reset state)
 */
export const clearAllLinksAtom = atom(null, (_get, set) => {
  set(scriptLinksAtom, initialState);
});

/**
 * Get links for a specific block
 */
export const getBlockLinksAtom = atom(null, (get, _set, blockId: string) => {
  const state = get(scriptLinksAtom);
  return state.links.get(blockId) ?? [];
});

/**
 * Get all links for a specific entity
 */
export const getEntityLinksAtom = atom(null, (get, _set, entityId: string) => {
  const allLinks = get(allLinksAtom);
  return allLinks.filter((l) => l.entityId === entityId);
});

/**
 * Check if an entity is orphaned
 */
export const isEntityOrphanedAtom = atom(null, (get, _set, entityId: string) => {
  const state = get(scriptLinksAtom);
  return state.orphanedLinks.has(entityId);
});

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to read the full script links state
 */
export function useScriptLinks() {
  return useAtomValue(scriptLinksAtom);
}

/**
 * Hook to read and write script links
 */
export function useScriptLinksState() {
  return useAtom(scriptLinksAtom);
}

/**
 * Hook to get all links as flat array
 */
export function useAllLinks() {
  return useAtomValue(allLinksAtom);
}

/**
 * Hook to get links grouped by entity type
 */
export function useLinksByEntityType() {
  return useAtomValue(linksByEntityTypeAtom);
}

/**
 * Hook to get unique entity IDs by type
 */
export function useUniqueEntityIdsByType() {
  return useAtomValue(uniqueEntityIdsByTypeAtom);
}

/**
 * Hook to initialize script links
 */
export function useInitializeScriptLinks() {
  return useSetAtom(initializeScriptLinksAtom);
}

/**
 * Hook to add a link
 */
export function useAddLink() {
  return useSetAtom(addLinkAtom);
}

/**
 * Hook to remove a link
 */
export function useRemoveLink() {
  return useSetAtom(removeLinkAtom);
}

/**
 * Hook to remove all links for a block
 */
export function useRemoveBlockLinks() {
  return useSetAtom(removeBlockLinksAtom);
}

/**
 * Hook to mark entities as orphaned
 */
export function useMarkOrphaned() {
  return useSetAtom(markOrphanedAtom);
}

/**
 * Hook to clear orphaned status
 */
export function useClearOrphaned() {
  return useSetAtom(clearOrphanedAtom);
}

/**
 * Hook to mark links as saved
 */
export function useMarkLinksSaved() {
  return useSetAtom(markLinksSavedAtom);
}

/**
 * Hook to get orphaned links count
 */
export function useOrphanedLinksCount() {
  return useAtomValue(orphanedLinksCountAtom);
}

/**
 * Hook to check if links are dirty
 */
export function useIsLinksDirty() {
  return useAtomValue(isLinksDirtyAtom);
}

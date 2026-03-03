import { useMutation } from '@tanstack/react-query';
import type { Editor } from '@tiptap/react';
import { useCallback, useMemo, useRef } from 'react';

import client from '@~/utils/orpc';

import type { iSceneInfo } from '../extensions/scene-metadata';
import { SCRIPT_BLOCK_TYPES } from '../types';

export interface iAppearance {
  entityType: 'character' | 'location' | 'prop';
  entityId: string;
  sceneRef: string;
  sceneId?: string;
  linkType: 'primary' | 'mention' | 'reference';
}

// Type alias for external use
export type Appearance = iAppearance;

export interface iUseAppearanceTrackerOptions {
  /** TipTap editor instance */
  editor: Editor | null;
  /** Script ID for API calls */
  scriptId: string;
  /** Series ID for API calls */
  seriesId: string;
  /** Whether the tracker is enabled */
  enabled?: boolean;
  /** Callback when sync completes */
  onSyncComplete?: (appearances: iAppearance[]) => void;
  /** Callback when sync fails */
  onSyncError?: (error: Error) => void;
}

// Type alias for external use
export type UseAppearanceTrackerOptions = iUseAppearanceTrackerOptions;

export interface iUseAppearanceTrackerResult {
  /** Current appearances extracted from editor */
  appearances: iAppearance[];
  /** Whether a sync is in progress */
  isSyncing: boolean;
  /** Manually trigger a sync */
  sync: () => Promise<void>;
  /** Extract appearances without syncing */
  extractAppearances: () => iAppearance[];
}

// Type alias for external use
export type UseAppearanceTrackerResult = iUseAppearanceTrackerResult;

/**
 * Extract all entity appearances from the editor document
 */
function extractAppearancesFromDoc(editor: Editor): iAppearance[] {
  const appearances: iAppearance[] = [];
  let currentSceneRef = '';
  let currentSceneId: string | undefined;

  editor.state.doc.descendants((node) => {
    // Track current scene
    if (node.type.name === SCRIPT_BLOCK_TYPES['scene-heading']) {
      currentSceneRef = node.textContent.trim();
      currentSceneId = node.attrs.sceneId ?? undefined;

      // Check for location link in scene heading
      const locationId = node.attrs.locationId as string | undefined;
      if (locationId) {
        appearances.push({
          entityType: 'location',
          entityId: locationId,
          sceneRef: currentSceneRef,
          sceneId: currentSceneId,
          linkType: 'primary',
        });
      }
    }

    // Track character blocks with linked IDs
    if (node.type.name === SCRIPT_BLOCK_TYPES.character) {
      const characterId = node.attrs.characterId as string | undefined;
      if (characterId) {
        appearances.push({
          entityType: 'character',
          entityId: characterId,
          sceneRef: currentSceneRef,
          sceneId: currentSceneId,
          linkType: 'primary',
        });
      }
    }

    // Track mentions in inline text
    node.marks.forEach((mark) => {
      if (mark.type.name === 'mentionMark') {
        const entityId = mark.attrs.entityId as string;
        const entityType = mark.attrs.entityType as 'character' | 'prop';

        if (entityType === 'character' || entityType === 'prop') {
          appearances.push({
            entityType,
            entityId,
            sceneRef: currentSceneRef,
            sceneId: currentSceneId,
            linkType: 'mention',
          });
        }
      }
    });

    return true;
  });

  return appearances;
}

/**
 * Deduplicate appearances by entity within each scene
 */
function deduplicateAppearances(appearances: iAppearance[]): iAppearance[] {
  const seen = new Map<string, iAppearance>();

  for (const appearance of appearances) {
    // Key by sceneRef + entityType + entityId
    const key = `${appearance.sceneRef}:${appearance.entityType}:${appearance.entityId}`;

    // Prefer 'primary' link type over 'mention'
    const existing = seen.get(key);
    if (!existing || (appearance.linkType === 'primary' && existing.linkType !== 'primary')) {
      seen.set(key, appearance);
    }
  }

  return Array.from(seen.values());
}

/**
 * Hook to track and sync entity appearances in the script editor
 */
export function useAppearanceTracker({
  editor,
  scriptId,
  seriesId,
  enabled = true,
  onSyncComplete,
  onSyncError,
}: iUseAppearanceTrackerOptions): iUseAppearanceTrackerResult {
  const lastSyncedRef = useRef<string>('');

  // Mutation for syncing appearances
  const syncMutation = useMutation({
    mutationFn: async (appearances: iAppearance[]) =>
      client.scriptKBIntegration.syncAppearances({
        scriptId,
        seriesId,
        appearances: appearances.map((a) => ({
          entityType: a.entityType,
          entityId: a.entityId,
          sceneRef: a.sceneRef,
          sceneId: a.sceneId,
          linkType: a.linkType,
        })),
      }),
    onSuccess: (_data, variables) => {
      onSyncComplete?.(variables);
    },
    onError: (error) => {
      onSyncError?.(error);
    },
  });

  // Extract appearances from current editor state
  const extractAppearances = useCallback((): iAppearance[] => {
    if (!editor) return [];
    const raw = extractAppearancesFromDoc(editor);
    return deduplicateAppearances(raw);
  }, [editor]);

  // Current appearances (memoized)
  const appearances = useMemo(() => {
    if (!editor || !enabled) return [];
    return extractAppearances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, enabled, editor?.state.doc]);

  // Sync function
  const sync = useCallback(async () => {
    if (!editor || !enabled) return;

    const currentAppearances = extractAppearances();

    // Skip if nothing changed
    const serialized = JSON.stringify(currentAppearances);
    if (serialized === lastSyncedRef.current) return;

    lastSyncedRef.current = serialized;
    await syncMutation.mutateAsync(currentAppearances);
  }, [editor, enabled, extractAppearances, syncMutation]);

  return {
    appearances,
    isSyncing: syncMutation.isPending,
    sync,
    extractAppearances,
  };
}

/**
 * Get appearances from SceneInfo array (alternative extraction)
 */
export function getAppearancesFromScenes(scenes: iSceneInfo[]): iAppearance[] {
  const appearances: iAppearance[] = [];

  for (const scene of scenes) {
    // Characters from the scene
    for (const characterId of scene.characterIds) {
      appearances.push({
        entityType: 'character',
        entityId: characterId,
        sceneRef: scene.sceneRef,
        sceneId: scene.sceneId ?? undefined,
        linkType: 'mention',
      });
    }

    // Props from the scene
    for (const propId of scene.propIds) {
      appearances.push({
        entityType: 'prop',
        entityId: propId,
        sceneRef: scene.sceneRef,
        sceneId: scene.sceneId ?? undefined,
        linkType: 'mention',
      });
    }

    // Location from the scene
    if (scene.locationId) {
      appearances.push({
        entityType: 'location',
        entityId: scene.locationId,
        sceneRef: scene.sceneRef,
        sceneId: scene.sceneId ?? undefined,
        linkType: 'primary',
      });
    }
  }

  return appearances;
}

import { useMemo, useCallback, useState } from 'react';

import { MentionMark, SceneMetadata } from '../extensions';
import type { iSceneInfo } from '../extensions';

export interface iUseKBIntegrationOptions {
  /** Series ID for API calls */
  seriesId: string;
  /** Script ID for API calls */
  scriptId: string;
  /** Callback when scenes change */
  onScenesChange?: (scenes: iSceneInfo[]) => unknown;
}

export interface iUseKBIntegrationResult {
  /** Extensions to add to the editor */
  extensions: ReturnType<typeof createKBExtensions>;
  /** Current scenes in document */
  scenes: iSceneInfo[];
}

/**
 * Create KB integration extensions
 *
 * Note: The entity mention extensions (CharacterMention, PropMention, WildcardMention)
 * require additional setup with React portals for rendering suggestion UI.
 * For a full implementation, use these extensions separately with the
 * EntityAutocomplete component and tippy.js for positioning.
 */
function createKBExtensions(onScenesChange?: (scenes: iSceneInfo[]) => unknown) {
  return [
    // Mention mark for rendering linked entities
    MentionMark,

    // Scene metadata tracking
    SceneMetadata.configure({
      onScenesUpdate: onScenesChange,
    }),
  ];
}

/**
 * Hook for KB integration with the script editor
 *
 * Provides configured extensions for entity mentions and scene tracking.
 *
 * @example
 * ```tsx
 * const { extensions, scenes } = useKBIntegration({
 *   seriesId,
 *   scriptId,
 *   onScenesChange: (scenes) => console.log('Scenes updated:', scenes),
 * });
 *
 * const editor = useEditor({
 *   extensions: [
 *     // ... base extensions
 *     ...extensions,
 *     // Add mention extensions with configured suggestions
 *     CharacterMention.configure({ suggestion: characterSuggestion }),
 *     PropMention.configure({ suggestion: propSuggestion }),
 *   ],
 * });
 * ```
 */
export function useKBIntegration({ onScenesChange }: iUseKBIntegrationOptions): iUseKBIntegrationResult {
  const [scenes, setScenes] = useState<iSceneInfo[]>([]);

  const handleScenesChange = useCallback(
    (newScenes: iSceneInfo[]) => {
      setScenes(newScenes);
      onScenesChange?.(newScenes);
    },
    [onScenesChange],
  );

  const extensions = useMemo(() => createKBExtensions(handleScenesChange), [handleScenesChange]);

  return {
    extensions,
    scenes,
  };
}

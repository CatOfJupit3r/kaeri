import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SuggestionOptions, SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { useCallback, useMemo, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { EntityAutocompleteRef } from '../components/entity-autocomplete';
import { EntityAutocomplete } from '../components/entity-autocomplete';
import type { iLocationBlockSuggestion } from '../extensions/scene-heading-suggestion';

interface iSceneHeadingSuggestionRenderState {
  floatingElement: HTMLElement | null;
  root: Root | null;
  cleanup: (() => void) | null;
}

export interface iUseSceneHeadingSuggestionRendererOptions {
  /** Suggestions to display */
  suggestions: iLocationBlockSuggestion[];
  /** Whether suggestions are loading */
  isLoading: boolean;
  /** Called when search query changes */
  onQueryChange: (query: string) => void;
  /** Called when a location is selected */
  onSelect: (location: iLocationBlockSuggestion) => void;
  /** Called when "+ Create" is selected */
  onCreate?: (name: string) => void;
  /** Whether to show the create option */
  showCreateOption?: boolean;
}

// Type alias for external use
export type UseSceneHeadingSuggestionRendererOptions = iUseSceneHeadingSuggestionRendererOptions;

interface iSceneHeadingSuggestionRendererConfig extends Partial<SuggestionOptions<iLocationBlockSuggestion>> {
  items?: (props: { query: string }) => iLocationBlockSuggestion[] | Promise<iLocationBlockSuggestion[]>;
  render?: () => {
    onStart: (props: SuggestionProps<iLocationBlockSuggestion>) => void;
    onUpdate: (props: SuggestionProps<iLocationBlockSuggestion>) => void;
    onKeyDown: (props: SuggestionKeyDownProps) => boolean;
    onExit: () => void;
  };
}

/**
 * Extracts location query from scene heading text.
 * Removes the INT./EXT. prefix to get the location search term.
 */
function extractLocationQuery(fullText: string): string {
  const prefixMatch = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*/i.exec(fullText);
  if (!prefixMatch) return fullText;
  return fullText.slice(prefixMatch[0].length);
}

/**
 * Creates a suggestion configuration for the SceneHeadingSuggestion TipTap extension.
 * Renders the EntityAutocomplete component for location selection in Scene Heading blocks.
 */
export function useSceneHeadingSuggestionRenderer({
  suggestions,
  isLoading,
  onQueryChange,
  onSelect,
  onCreate,
  showCreateOption = true,
}: iUseSceneHeadingSuggestionRendererOptions): iSceneHeadingSuggestionRendererConfig {
  // Keep refs to mutable state
  const stateRef = useRef<iSceneHeadingSuggestionRenderState>({
    floatingElement: null,
    root: null,
    cleanup: null,
  });
  const currentPropsRef = useRef<SuggestionProps<iLocationBlockSuggestion> | null>(null);
  const autocompleteRef = useRef<EntityAutocompleteRef | null>(null);

  // Store dynamic data in refs to prevent extension reconfiguration
  const suggestionsRef = useRef(suggestions);
  const isLoadingRef = useRef(isLoading);
  const onQueryChangeRef = useRef(onQueryChange);
  const onSelectRef = useRef(onSelect);
  const onCreateRef = useRef(onCreate);

  suggestionsRef.current = suggestions;
  isLoadingRef.current = isLoading;
  onQueryChangeRef.current = onQueryChange;
  onSelectRef.current = onSelect;
  onCreateRef.current = onCreate;

  // Create the render configuration
  const renderConfig = useCallback(() => {
    let container: HTMLElement | null = null;

    // Helper to create virtual element from clientRect
    const createVirtualElement = (clientRect: (() => DOMRect | null) | null | undefined) => ({
      getBoundingClientRect: () => clientRect?.() ?? new DOMRect(),
    });

    // Helper to update floating position
    const updatePosition = async (clientRect: (() => DOMRect | null) | null | undefined) => {
      if (!container || !stateRef.current.floatingElement) return;

      const virtualElement = createVirtualElement(clientRect);
      const { x, y } = await computePosition(virtualElement, stateRef.current.floatingElement, {
        placement: 'bottom-start',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
      });

      Object.assign(stateRef.current.floatingElement.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    };

    // Helper to hide the popup
    const hidePopup = () => {
      if (stateRef.current.floatingElement) {
        stateRef.current.floatingElement.style.display = 'none';
      }
    };

    return {
      onStart: (props: SuggestionProps<iLocationBlockSuggestion>) => {
        currentPropsRef.current = props;
        // Extract location query (remove INT./EXT. prefix)
        const locationQuery = extractLocationQuery(props.query);
        onQueryChangeRef.current(locationQuery);

        // Create floating container element
        const floatingEl = document.createElement('div');
        floatingEl.className = 'scene-heading-autocomplete-floating';
        floatingEl.style.cssText = `
          position: absolute;
          z-index: 9999;
          width: max-content;
          max-width: 320px;
        `;
        document.body.appendChild(floatingEl);
        stateRef.current.floatingElement = floatingEl;

        // Create container for React content
        container = document.createElement('div');
        container.className = 'scene-heading-autocomplete-container';
        floatingEl.appendChild(container);

        // Create React root and render
        const root = createRoot(container);
        stateRef.current.root = root;

        // Filter out loading placeholder before rendering
        const filteredSuggestions = suggestionsRef.current.filter((s) => s._id !== '__loading__');

        root.render(
          <EntityAutocomplete
            ref={autocompleteRef}
            query={locationQuery}
            isLoading={isLoadingRef.current}
            suggestions={filteredSuggestions}
            entityType="character" // Using character type for rendering, but data is locations
            onSelect={(entity) => {
              onSelectRef.current(entity);
              props.command(entity);
            }}
            onCreate={
              onCreateRef.current
                ? (name) => {
                    onCreateRef.current?.(name);
                  }
                : undefined
            }
            onClose={hidePopup}
            showCreateOption={showCreateOption}
          />,
        );

        // Set up auto-update for position
        const virtualElement = createVirtualElement(props.clientRect);
        stateRef.current.cleanup = autoUpdate(virtualElement, floatingEl, () => {
          void updatePosition(props.clientRect);
        });

        // Initial position update
        void updatePosition(props.clientRect);
      },

      onUpdate: (props: SuggestionProps<iLocationBlockSuggestion>) => {
        currentPropsRef.current = props;
        // Extract location query (remove INT./EXT. prefix)
        const locationQuery = extractLocationQuery(props.query);
        onQueryChangeRef.current(locationQuery);

        // Update floating position
        void updatePosition(props.clientRect);

        // Re-render with updated props
        if (stateRef.current.root && container) {
          // Filter out loading placeholder before rendering
          const filteredSuggestions = suggestionsRef.current.filter((s) => s._id !== '__loading__');

          stateRef.current.root.render(
            <EntityAutocomplete
              ref={autocompleteRef}
              query={locationQuery}
              isLoading={isLoadingRef.current}
              suggestions={filteredSuggestions}
              entityType="character" // Using character type for rendering, but data is locations
              onSelect={(entity) => {
                onSelectRef.current(entity);
                props.command(entity);
              }}
              onCreate={
                onCreateRef.current
                  ? (name) => {
                      onCreateRef.current?.(name);
                    }
                  : undefined
              }
              onClose={hidePopup}
              showCreateOption={showCreateOption}
            />,
          );
        }
      },

      onKeyDown: (props: SuggestionKeyDownProps): boolean => {
        // Let the autocomplete component handle keyboard events
        if (autocompleteRef.current) {
          return autocompleteRef.current.onKeyDown(props.event);
        }
        return false;
      },

      onExit: () => {
        // Cleanup auto-update
        stateRef.current.cleanup?.();
        stateRef.current.cleanup = null;

        // Unmount React root
        stateRef.current.root?.unmount();
        stateRef.current.root = null;

        // Remove floating element from DOM
        stateRef.current.floatingElement?.remove();
        stateRef.current.floatingElement = null;

        currentPropsRef.current = null;
      },
    };
  }, [showCreateOption]);

  // Build the suggestion configuration
  const suggestionConfig = useMemo<iSceneHeadingSuggestionRendererConfig>(
    () => ({
      // Trigger query change and return items
      items: ({ query }) => {
        // Extract location part (remove INT./EXT. prefix)
        const locationQuery = extractLocationQuery(query);
        // Update the query to fetch suggestions
        onQueryChangeRef.current(locationQuery);
        // Return current suggestions
        // If no suggestions yet, return placeholder to trigger popup
        // This ensures onStart/onUpdate callbacks are called
        const items =
          suggestionsRef.current.length > 0 ? suggestionsRef.current : [{ _id: '__loading__', name: 'Loading...' }];
        return items;
      },
      render: renderConfig,
    }),
    [renderConfig],
  );

  return suggestionConfig;
}

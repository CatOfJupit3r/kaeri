import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { ReactRenderer } from '@tiptap/react';
import type { SuggestionOptions, SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { useCallback, useMemo, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { EntityAutocompleteRef } from '../components/entity-autocomplete';
import { EntityAutocomplete } from '../components/entity-autocomplete';
import type { iEntitySuggestion, EntityType } from '../extensions/entity-mention';

interface iSuggestionRenderState {
  component: ReactRenderer | null;
  floatingElement: HTMLElement | null;
  root: Root | null;
  cleanup: (() => void) | null;
}

export interface iUseSuggestionRendererOptions {
  /** Entity type being suggested */
  entityType: EntityType;
  /** Suggestions to display */
  suggestions: iEntitySuggestion[];
  /** Whether suggestions are loading */
  isLoading: boolean;
  /** Called when search query changes */
  onQueryChange: (query: string) => void;
  /** Called when an entity is selected */
  onSelect: (entity: iEntitySuggestion) => void;
  /** Called when "+ Create" is selected */
  onCreate?: (name: string) => void;
  /** Whether to show the create option */
  showCreateOption?: boolean;
}

// Type alias for external use
export type UseSuggestionRendererOptions = iUseSuggestionRendererOptions;

interface iSuggestionRendererConfig extends Partial<SuggestionOptions<iEntitySuggestion>> {
  /** Force-provided items (passed from hook) */
  items?: (props: { query: string }) => iEntitySuggestion[] | Promise<iEntitySuggestion[]>;
  /** Render function configuration */
  render?: () => {
    onStart: (props: SuggestionProps<iEntitySuggestion>) => void;
    onUpdate: (props: SuggestionProps<iEntitySuggestion>) => void;
    onKeyDown: (props: SuggestionKeyDownProps) => boolean;
    onExit: () => void;
  };
}

/**
 * Creates a suggestion configuration for TipTap's suggestion plugin
 * that renders the EntityAutocomplete component using @floating-ui/dom for positioning.
 *
 * @example
 * ```tsx
 * const { suggestions, isLoading, setQuery } = useCharacterSuggestions({ seriesId });
 *
 * const suggestionConfig = useSuggestionRenderer({
 *   entityType: 'character',
 *   suggestions,
 *   isLoading,
 *   onQueryChange: setQuery,
 *   onSelect: handleEntitySelect,
 *   onCreate: handleCreateCharacter,
 * });
 *
 * // Use with CharacterMention extension
 * CharacterMention.configure({
 *   suggestion: suggestionConfig,
 * });
 * ```
 */
export function useSuggestionRenderer({
  entityType,
  suggestions,
  isLoading,
  onQueryChange,
  onSelect,
  onCreate,
  showCreateOption = true,
}: iUseSuggestionRendererOptions): iSuggestionRendererConfig {
  // Keep refs to mutable state
  const stateRef = useRef<iSuggestionRenderState>({
    component: null,
    floatingElement: null,
    root: null,
    cleanup: null,
  });
  const currentPropsRef = useRef<SuggestionProps<iEntitySuggestion> | null>(null);
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
      onStart: (props: SuggestionProps<iEntitySuggestion>) => {
        currentPropsRef.current = props;
        onQueryChangeRef.current(props.query);

        // Create floating container element
        const floatingEl = document.createElement('div');
        floatingEl.className = 'entity-autocomplete-floating';
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
        container.className = 'entity-autocomplete-container';
        floatingEl.appendChild(container);

        // Create React root and render
        const root = createRoot(container);
        stateRef.current.root = root;

        root.render(
          <EntityAutocomplete
            ref={autocompleteRef}
            query={props.query}
            isLoading={isLoadingRef.current}
            suggestions={suggestionsRef.current}
            entityType={entityType}
            onSelect={(entity) => {
              onSelectRef.current(entity);
              props.command(entity);
            }}
            onCreate={
              onCreateRef.current
                ? (name) => {
                    onCreateRef.current?.(name);
                    // Don't call command - let the create flow handle it
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

      onUpdate: (props: SuggestionProps<iEntitySuggestion>) => {
        currentPropsRef.current = props;
        onQueryChangeRef.current(props.query);

        // Update floating position
        void updatePosition(props.clientRect);

        // Re-render with updated props
        if (stateRef.current.root && container) {
          stateRef.current.root.render(
            <EntityAutocomplete
              ref={autocompleteRef}
              query={props.query}
              isLoading={isLoadingRef.current}
              suggestions={suggestionsRef.current}
              entityType={entityType}
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
  }, [entityType, showCreateOption]);

  // Build the suggestion configuration
  const suggestionConfig = useMemo<iSuggestionRendererConfig>(
    () => ({
      // Don't fetch items here - they come from props
      items: () => suggestionsRef.current,
      render: renderConfig,
    }),
    [renderConfig],
  );

  return suggestionConfig;
}

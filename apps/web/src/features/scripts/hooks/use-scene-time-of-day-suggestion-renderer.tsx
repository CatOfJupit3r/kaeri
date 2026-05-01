import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { useCallback, useMemo, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { EntityAutocompleteRef } from '../components/entity-autocomplete';
import { EntityAutocomplete } from '../components/entity-autocomplete';
import type { iSceneTimeOfDaySuggestion } from '../extensions/scene-time-of-day-suggestion';

interface iSceneTimeOfDaySuggestionRenderState {
  floatingElement: HTMLElement | null;
  root: Root | null;
  cleanup: (() => void) | null;
}

export interface iUseSceneTimeOfDaySuggestionRendererOptions {
  suggestions: iSceneTimeOfDaySuggestion[];
  isLoading: boolean;
  onSelect: (timeOfDay: iSceneTimeOfDaySuggestion) => void;
}

export type UseSceneTimeOfDaySuggestionRendererOptions = iUseSceneTimeOfDaySuggestionRendererOptions;

interface iSceneTimeOfDaySuggestionRendererConfig extends Partial<SuggestionOptions<iSceneTimeOfDaySuggestion>> {
  items?: (props: { query: string }) => iSceneTimeOfDaySuggestion[] | Promise<iSceneTimeOfDaySuggestion[]>;
  render?: () => {
    onStart: (props: SuggestionProps<iSceneTimeOfDaySuggestion>) => void;
    onUpdate: (props: SuggestionProps<iSceneTimeOfDaySuggestion>) => void;
    onKeyDown: (props: SuggestionKeyDownProps) => boolean;
    onExit: () => void;
  };
}

function escapeRegExp(value: string) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTimeOfDayQuery(query: string) {
  return query.trim();
}

function filterTimeOfDaySuggestions(suggestions: iSceneTimeOfDaySuggestion[], query: string) {
  const normalizedQuery = normalizeTimeOfDayQuery(query);

  if (!normalizedQuery) {
    return suggestions;
  }

  const searchPattern = new RegExp(escapeRegExp(normalizedQuery), 'i');

  return suggestions.filter((suggestion) => searchPattern.test(suggestion.name));
}

export function useSceneTimeOfDaySuggestionRenderer({
  suggestions,
  isLoading,
  onSelect,
}: iUseSceneTimeOfDaySuggestionRendererOptions): iSceneTimeOfDaySuggestionRendererConfig {
  const stateRef = useRef<iSceneTimeOfDaySuggestionRenderState>({
    floatingElement: null,
    root: null,
    cleanup: null,
  });
  const autocompleteRef = useRef<EntityAutocompleteRef | null>(null);
  const suggestionsRef = useRef(suggestions);
  const isLoadingRef = useRef(isLoading);
  const onSelectRef = useRef(onSelect);

  suggestionsRef.current = suggestions;
  isLoadingRef.current = isLoading;
  onSelectRef.current = onSelect;

  const renderConfig = useCallback(() => {
    let container: HTMLElement | null = null;

    const createVirtualElement = (clientRect: (() => DOMRect | null) | null | undefined) => ({
      getBoundingClientRect: () => clientRect?.() ?? new DOMRect(),
    });

    const updatePosition = async (clientRect: (() => DOMRect | null) | null | undefined) => {
      if (!container || !stateRef.current.floatingElement) {
        return;
      }

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

    const hidePopup = () => {
      if (stateRef.current.floatingElement) {
        stateRef.current.floatingElement.style.display = 'none';
      }
    };

    const renderAutocomplete = (props: SuggestionProps<iSceneTimeOfDaySuggestion>) => {
      if (!stateRef.current.root || !container) {
        return;
      }

      stateRef.current.root.render(
        <EntityAutocomplete
          ref={autocompleteRef}
          query={normalizeTimeOfDayQuery(props.query)}
          isLoading={isLoadingRef.current}
          suggestions={filterTimeOfDaySuggestions(suggestionsRef.current, props.query)}
          entityType="time-of-day"
          onSelect={(entity) => {
            onSelectRef.current(entity);
            props.command(entity);
          }}
          onClose={hidePopup}
          showCreateOption={false}
        />,
      );
    };

    return {
      onStart: (props: SuggestionProps<iSceneTimeOfDaySuggestion>) => {
        const floatingEl = document.createElement('div');
        floatingEl.className = 'scene-time-of-day-autocomplete-floating';
        floatingEl.style.cssText = `
          position: absolute;
          z-index: 9999;
          width: max-content;
          max-width: 320px;
        `;
        document.body.appendChild(floatingEl);
        stateRef.current.floatingElement = floatingEl;

        container = document.createElement('div');
        container.className = 'scene-time-of-day-autocomplete-container';
        floatingEl.appendChild(container);

        stateRef.current.root = createRoot(container);
        renderAutocomplete(props);

        const virtualElement = createVirtualElement(props.clientRect);
        stateRef.current.cleanup = autoUpdate(virtualElement, floatingEl, () => {
          void updatePosition(props.clientRect);
        });

        void updatePosition(props.clientRect);
      },

      onUpdate: (props: SuggestionProps<iSceneTimeOfDaySuggestion>) => {
        void updatePosition(props.clientRect);
        renderAutocomplete(props);
      },

      onKeyDown: (props: SuggestionKeyDownProps): boolean => {
        if (autocompleteRef.current) {
          return autocompleteRef.current.onKeyDown(props.event);
        }

        return false;
      },

      onExit: () => {
        stateRef.current.cleanup?.();
        stateRef.current.cleanup = null;
        stateRef.current.root?.unmount();
        stateRef.current.root = null;
        stateRef.current.floatingElement?.remove();
        stateRef.current.floatingElement = null;
      },
    };
  }, []);

  return useMemo<iSceneTimeOfDaySuggestionRendererConfig>(
    () => ({
      items: ({ query }) => {
        const filteredSuggestions = filterTimeOfDaySuggestions(suggestionsRef.current, query);

        if (filteredSuggestions.length > 0) {
          return filteredSuggestions;
        }

        if (isLoadingRef.current) {
          return [{ _id: '__loading__', name: 'Loading...' }];
        }

        return [];
      },
      render: renderConfig,
    }),
    [renderConfig],
  );
}

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@~/lib/utils';

import type { iEntitySuggestion, EntityType } from '../../extensions/entity-mention';
import { CreateEntityOption } from './create-entity-option';
import { SuggestionList } from './suggestion-list';
import { useAutocompleteKeyboard } from './use-autocomplete-keyboard';

export interface iEntityAutocompleteProps {
  /** Current search query */
  query: string;
  /** Loading state */
  isLoading?: boolean;
  /** Suggestions from API */
  suggestions: iEntitySuggestion[];
  /** Entity type being searched */
  entityType: EntityType;
  /** Called when an entity is selected */
  onSelect: (entity: iEntitySuggestion) => void;
  /** Called when user wants to create a new entity */
  onCreate?: (name: string) => void;
  /** Called when the dropdown should close */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the create option */
  showCreateOption?: boolean;
}

// Type alias for external use
export type EntityAutocompleteProps = iEntityAutocompleteProps;

export interface iEntityAutocompleteRef {
  /** Handle keyboard events */
  onKeyDown: (event: KeyboardEvent) => boolean;
}

// Type alias for external use
export type EntityAutocompleteRef = iEntityAutocompleteRef;

/**
 * Entity Autocomplete Component
 *
 * Renders suggestion dropdown with keyboard navigation support.
 * Designed to be controlled by TipTap suggestion plugin.
 */
export const EntityAutocomplete = forwardRef<iEntityAutocompleteRef, iEntityAutocompleteProps>(
  (
    {
      query,
      isLoading = false,
      suggestions,
      entityType,
      onSelect,
      onCreate,
      onClose,
      className,
      showCreateOption = true,
    },
    ref,
  ) => {
    const listRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Include "+ Create" as a virtual item if applicable
    const showCreate = showCreateOption && query.length >= 2 && onCreate;
    const totalItems = suggestions.length + (showCreate ? 1 : 0);

    // Reset selection when suggestions change
    useEffect(() => {
      setSelectedIndex(0);
    }, [suggestions, query]);

    // Handle selection
    const handleSelect = useCallback(
      (index: number) => {
        if (index === suggestions.length && showCreate) {
          onCreate?.(query);
        } else if (suggestions[index]) {
          onSelect(suggestions[index]);
        }
      },
      [suggestions, showCreate, onCreate, query, onSelect],
    );

    // Keyboard navigation
    const { onKeyDown } = useAutocompleteKeyboard({
      itemCount: totalItems,
      selectedIndex,
      onSelectedIndexChange: setSelectedIndex,
      onSelect: handleSelect,
      onClose,
    });

    // Expose keyboard handler to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        onKeyDown: (event: KeyboardEvent) => onKeyDown(event),
      }),
      [onKeyDown],
    );

    // Scroll selected item into view
    useEffect(() => {
      const list = listRef.current;
      if (!list) return;

      const selectedItem = list.querySelector(`[data-index="${selectedIndex}"]`);
      selectedItem?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const isEmpty = suggestions.length === 0 && !showCreate;
    const isLoadingEmpty = isLoading && suggestions.length === 0;

    const renderContent = () => {
      if (isLoadingEmpty) {
        return <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">Searching...</div>;
      }

      if (isEmpty) {
        return (
          <div className="flex flex-col items-center justify-center gap-1 p-4 text-muted-foreground">
            <span className="text-sm">No {entityType}s found</span>
            {query.length >= 2 && onCreate ? (
              <CreateEntityOption
                query={query}
                entityType={entityType}
                onClick={() => onCreate(query)}
                isSelected={false}
              />
            ) : null}
          </div>
        );
      }

      return (
        <>
          <SuggestionList
            suggestions={suggestions}
            entityType={entityType}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            onHover={setSelectedIndex}
          />
          {showCreate ? (
            <CreateEntityOption
              query={query}
              entityType={entityType}
              onClick={() => onCreate?.(query)}
              isSelected={selectedIndex === suggestions.length}
              data-index={suggestions.length}
            />
          ) : null}
        </>
      );
    };

    return (
      <div
        ref={listRef}
        className={cn(
          'z-50 max-h-72 w-64 overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-lg',
          className,
        )}
        role="listbox"
        aria-label={`${entityType} suggestions`}
      >
        {renderContent()}
      </div>
    );
  },
);

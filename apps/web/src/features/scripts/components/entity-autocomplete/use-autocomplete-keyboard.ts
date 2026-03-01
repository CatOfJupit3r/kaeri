import { useCallback } from 'react';

export interface iAutocompleteKeyboardOptions {
  /** Total number of items in the list (including create option) */
  itemCount: number;
  /** Currently selected index */
  selectedIndex: number;
  /** Called when selected index changes */
  onSelectedIndexChange: (index: number) => void;
  /** Called when item is selected (Enter) */
  onSelect: (index: number) => void;
  /** Called when dropdown should close (Escape) */
  onClose: () => void;
}

// Type alias for external use
export type AutocompleteKeyboardOptions = iAutocompleteKeyboardOptions;

/**
 * Keyboard Navigation Hook
 *
 * Returns an onKeyDown handler that manages keyboard navigation.
 * Returns true if the event was handled, false otherwise.
 */
export function useAutocompleteKeyboard({
  itemCount,
  selectedIndex,
  onSelectedIndexChange,
  onSelect,
  onClose,
}: iAutocompleteKeyboardOptions) {
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (itemCount === 0) {
        // Only Escape should close when empty
        if (event.key === 'Escape') {
          onClose();
          return true;
        }
        return false;
      }

      switch (event.key) {
        case 'ArrowUp': {
          // Move selection up, wrap to bottom if at top
          const newIndex = selectedIndex <= 0 ? itemCount - 1 : selectedIndex - 1;
          onSelectedIndexChange(newIndex);
          return true;
        }

        case 'ArrowDown': {
          // Move selection down, wrap to top if at bottom
          const newIndex = selectedIndex >= itemCount - 1 ? 0 : selectedIndex + 1;
          onSelectedIndexChange(newIndex);
          return true;
        }

        case 'Enter':
        case 'Tab': {
          // Select current item
          event.preventDefault();
          onSelect(selectedIndex);
          return true;
        }

        case 'Escape': {
          // Close dropdown
          onClose();
          return true;
        }

        default:
          return false;
      }
    },
    [itemCount, selectedIndex, onSelectedIndexChange, onSelect, onClose],
  );

  return { onKeyDown };
}

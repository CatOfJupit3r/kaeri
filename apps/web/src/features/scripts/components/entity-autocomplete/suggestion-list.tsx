import { memo } from 'react';

import type { iEntitySuggestion, EntityType } from '../../extensions/entity-mention';
import { SuggestionItem } from './suggestion-item';

export interface iSuggestionListProps {
  /** List of suggestions to render */
  suggestions: iEntitySuggestion[];
  /** Entity type for styling */
  entityType: EntityType;
  /** Currently selected index */
  selectedIndex: number;
  /** Called when a suggestion is clicked */
  onSelect: (entity: iEntitySuggestion) => void;
  /** Called when mouse hovers over an item */
  onHover?: (index: number) => void;
}

// Type alias for external use
export type SuggestionListProps = iSuggestionListProps;

/**
 * Suggestion List Component
 *
 * Renders entity suggestions with selection state and hover handlers.
 */
export const SuggestionList = memo(
  ({ suggestions, entityType, selectedIndex, onSelect, onHover }: iSuggestionListProps) => {
    if (suggestions.length === 0) return null;

    return (
      <div className="py-1" role="group" aria-label={`${entityType} suggestions`}>
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={suggestion._id}
            suggestion={suggestion}
            entityType={entityType}
            isSelected={index === selectedIndex}
            onClick={() => onSelect(suggestion)}
            onMouseEnter={() => onHover?.(index)}
            data-index={index}
          />
        ))}
      </div>
    );
  },
);

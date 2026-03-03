import { memo } from 'react';
import { LuUser, LuMapPin, LuBox } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { cn } from '@~/lib/utils';

import type { iEntitySuggestion, EntityType } from '../../extensions/entity-mention';

export interface iSuggestionItemProps {
  /** The suggestion to render */
  suggestion: iEntitySuggestion;
  /** Entity type for styling */
  entityType: EntityType;
  /** Whether this item is currently selected */
  isSelected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Mouse enter handler */
  onMouseEnter?: () => void;
  /** Data attribute for scroll-into-view */
  'data-index'?: number;
}

// Type alias for external use
export type SuggestionItemProps = iSuggestionItemProps;

const ENTITY_TYPE_ICONS = {
  character: LuUser,
  prop: LuBox,
  wildcard: LuMapPin,
} as const;

const ENTITY_TYPE_COLORS = {
  character: 'text-blue-500',
  prop: 'text-amber-500',
  wildcard: 'text-emerald-500',
} as const;

/**
 * Suggestion Item Component
 *
 * Displays entity with avatar (or icon fallback), name, and optional preview text.
 */
export const SuggestionItem = memo(
  ({ suggestion, entityType, isSelected, onClick, onMouseEnter, 'data-index': dataIndex }: iSuggestionItemProps) => {
    const Icon = ENTITY_TYPE_ICONS[entityType as keyof typeof ENTITY_TYPE_ICONS];
    const iconColor = ENTITY_TYPE_COLORS[entityType as keyof typeof ENTITY_TYPE_COLORS];

    return (
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
          'hover:bg-accent focus:bg-accent focus:outline-none',
          isSelected && 'bg-accent',
        )}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        data-index={dataIndex}
      >
        <Avatar className="size-8 shrink-0">
          {suggestion.avatarUrl ? <AvatarImage src={suggestion.avatarUrl} alt={suggestion.name} /> : null}
          <AvatarFallback className={cn('bg-muted', iconColor)}>
            <Icon className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{suggestion.name}</div>
          {suggestion.preview ? (
            <div className="truncate text-xs text-muted-foreground">{suggestion.preview}</div>
          ) : null}
        </div>
      </button>
    );
  },
);

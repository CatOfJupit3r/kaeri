import { memo } from 'react';
import { LuPlus } from 'react-icons/lu';

import { cn } from '@~/lib/utils';

import type { EntityType } from '../../extensions/entity-mention';

export interface iCreateEntityOptionProps {
  /** The query/name to create */
  query: string;
  /** Entity type being created */
  entityType: EntityType;
  /** Click handler */
  onClick: () => void;
  /** Whether this option is selected */
  isSelected: boolean;
  /** Data attribute for scroll-into-view */
  'data-index'?: number;
}

// Type alias for external use
export type CreateEntityOptionProps = iCreateEntityOptionProps;

const ENTITY_TYPE_LABELS = {
  character: 'character',
  prop: 'prop',
  wildcard: 'entity',
};

/**
 * Create Entity Option Component
 *
 * Displays as a special option that triggers quick-create flow.
 */
export const CreateEntityOption = memo(
  ({ query, entityType, onClick, isSelected, 'data-index': dataIndex }: iCreateEntityOptionProps) => {
    const label = ENTITY_TYPE_LABELS[entityType as keyof typeof ENTITY_TYPE_LABELS];

    return (
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        className={cn(
          'flex w-full items-center gap-3 border-t px-3 py-2 text-left transition-colors',
          'text-primary hover:bg-accent focus:bg-accent focus:outline-none',
          isSelected && 'bg-accent',
        )}
        onClick={onClick}
        data-index={dataIndex}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <LuPlus className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium">
            Create &quot;{query}&quot; as {label}
          </span>
        </div>
      </button>
    );
  },
);

import { memo, useEffect, useRef, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card } from '@~/components/ui/card';
import { cn } from '@~/lib/utils';

import type { EntityType } from '../../extensions/entity-mention';
import { CharacterPreview } from './character-preview';
import { LocationPreview } from './location-preview';
import { PropPreview } from './prop-preview';
import { WildcardPreview } from './wildcard-preview';

export interface iEntityPreviewCardProps {
  /** Entity ID to preview */
  entityId: string;
  /** Entity type */
  entityType: EntityType;
  /** Target position (bottom center of trigger element) */
  position: { x: number; y: number; targetTop?: number };
  /** Called when user clicks outside or presses Escape */
  onClose: () => void;
  /** Called when user clicks "Open in KB" */
  onOpenInKB: () => void;
  /** Called when mouse enters the card */
  onMouseEnter?: () => void;
  /** Called when mouse leaves the card */
  onMouseLeave?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Series ID for data fetching */
  seriesId: string;
}

const CARD_WIDTH = 300;
const CARD_MARGIN = 16;
const CARD_GAP = 12; // Gap between card and target element

/**
 * Calculate card position to avoid viewport edges
 */
function calculatePosition(
  target: { x: number; y: number; targetTop?: number },
  cardHeight: number,
): { x: number; y: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = target.x - CARD_WIDTH / 2;
  let { y } = target;

  // Ensure card stays within horizontal bounds
  if (x < CARD_MARGIN) {
    x = CARD_MARGIN;
  } else if (x + CARD_WIDTH > viewportWidth - CARD_MARGIN) {
    x = viewportWidth - CARD_WIDTH - CARD_MARGIN;
  }

  // If card would go below viewport, show above target
  if (y + cardHeight > viewportHeight - CARD_MARGIN) {
    if (typeof target.targetTop === 'number') {
      // Position above the target element with proper gap
      y = target.targetTop - cardHeight - CARD_GAP;
    } else {
      // Fallback if targetTop not provided
      y = target.y - CARD_GAP - cardHeight - CARD_GAP;
    }
  }

  return { x, y };
}

/**
 * Entity Preview Card Component
 */
export const EntityPreviewCard = memo(
  ({
    entityId,
    entityType,
    position,
    onClose,
    onOpenInKB,
    onMouseEnter,
    onMouseLeave,
    className,
    seriesId,
  }: iEntityPreviewCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isPositioned, setIsPositioned] = useState(false);
    const [cardPosition, setCardPosition] = useState({ x: position.x - CARD_WIDTH / 2, y: position.y });

    // Calculate position after mount
    useEffect(() => {
      const cardHeight = cardRef.current?.offsetHeight ?? 200;
      setCardPosition(calculatePosition(position, cardHeight));
      setIsPositioned(true);
    }, [position]);

    // Close on Escape
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      // Use setTimeout to avoid closing from the same click that triggered the preview
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClose]);

    const content = (() => {
      switch (entityType) {
        case 'character':
          return <CharacterPreview entityId={entityId} seriesId={seriesId} />;
        case 'prop':
          return <PropPreview entityId={entityId} seriesId={seriesId} />;
        case 'wildcard':
          return <WildcardPreview entityId={entityId} seriesId={seriesId} />;
        default:
          return <div className="p-4 text-sm">Loading...</div>;
      }
    })();

    return (
      <Card
        ref={cardRef}
        className={cn(
          'entity-preview-card fixed z-50 w-75 overflow-hidden shadow-xl',
          'animate-in duration-200 fade-in-0 zoom-in-95',
          // Hide until position is calculated to prevent flash at (0, 0)
          !isPositioned && 'invisible',
          className,
        )}
        style={{
          left: cardPosition.x,
          top: cardPosition.y,
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          onMouseEnter?.();
        }}
        onMouseLeave={() => {
          onMouseLeave?.();
        }}
      >
        {content}

        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center gap-2" onClick={onOpenInKB}>
            <LuExternalLink className="size-4" />
            Open in Knowledge Base
          </Button>
        </div>
      </Card>
    );
  },
);

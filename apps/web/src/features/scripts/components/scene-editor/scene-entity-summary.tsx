import { memo, useMemo } from 'react';
import { LuBox, LuMapPin, LuUsers } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@~/components/ui/tooltip';
import { cn } from '@~/lib/utils';

import type { iSceneInfo } from '../../extensions/scene-metadata';
import type { EntityLinkRef } from '../../stores';

export interface iSceneEntitySummaryProps {
  /** Scene info from the editor */
  scene: iSceneInfo;
  /** Entity links in this scene */
  links: EntityLinkRef[];
  /** Whether any links are orphaned (entity deleted) */
  orphanedIds?: Set<string>;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for viewing entities */
  onClick?: () => void;
}

// Type alias for external use
export type SceneEntitySummaryProps = iSceneEntitySummaryProps;

interface iEntityCounts {
  characters: number;
  locations: number;
  props: number;
  total: number;
  orphaned: number;
}

/**
 * Scene Entity Summary Badge
 *
 * Displays compact badges showing character, location, and prop counts
 * for a scene. Shown inline with scene headings.
 */
export const SceneEntitySummary = memo(
  ({ scene: _scene, links, orphanedIds = new Set(), className, onClick }: iSceneEntitySummaryProps) => {
    const counts = useMemo<iEntityCounts>(() => {
      const result: iEntityCounts = {
        characters: 0,
        locations: 0,
        props: 0,
        total: 0,
        orphaned: 0,
      };

      for (const link of links) {
        if (orphanedIds.has(link.entityId)) {
          result.orphaned += 1;
        }

        switch (link.entityType) {
          case 'character':
            result.characters += 1;
            break;
          case 'location':
            result.locations += 1;
            break;
          case 'prop':
            result.props += 1;
            break;
          default:
            // Other entity types (scene, timeline, storyArc, theme) don't count
            break;
        }
        result.total += 1;
      }

      return result;
    }, [links, orphanedIds]);

    if (counts.total === 0) {
      return null;
    }

    const hasOrphaned = counts.orphaned > 0;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick) {
        e.preventDefault();
        onClick();
      }
    };

    const wrapperClassName = cn(
      'inline-flex items-center gap-1',
      onClick && 'cursor-pointer hover:opacity-80',
      className,
    );

    // Use a button when clickable for proper a11y
    if (onClick) {
      return (
        <button type="button" className={wrapperClassName} onClick={onClick} onKeyDown={handleKeyDown}>
          {counts.characters > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
                  <LuUsers className="size-3" />
                  {counts.characters}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {counts.characters} character{counts.characters !== 1 ? 's' : ''} in scene
              </TooltipContent>
            </Tooltip>
          ) : null}

          {counts.locations > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
                  <LuMapPin className="size-3" />
                  {counts.locations}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {counts.locations} location{counts.locations !== 1 ? 's' : ''} referenced
              </TooltipContent>
            </Tooltip>
          ) : null}

          {counts.props > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
                  <LuBox className="size-3" />
                  {counts.props}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {counts.props} prop{counts.props !== 1 ? 's' : ''} referenced
              </TooltipContent>
            </Tooltip>
          ) : null}

          {hasOrphaned ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {counts.orphaned} orphaned
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {counts.orphaned} entity reference{counts.orphaned !== 1 ? 's' : ''} no longer exist in Knowledge Base
              </TooltipContent>
            </Tooltip>
          ) : null}
        </button>
      );
    }

    // Non-clickable case - just a div
    return (
      <div className={wrapperClassName}>
        {counts.characters > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
                <LuUsers className="size-3" />
                {counts.characters}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {counts.characters} character{counts.characters !== 1 ? 's' : ''} in scene
            </TooltipContent>
          </Tooltip>
        ) : null}

        {counts.locations > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
                <LuMapPin className="size-3" />
                {counts.locations}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {counts.locations} location{counts.locations !== 1 ? 's' : ''} referenced
            </TooltipContent>
          </Tooltip>
        ) : null}

        {counts.props > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
                <LuBox className="size-3" />
                {counts.props}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {counts.props} prop{counts.props !== 1 ? 's' : ''} referenced
            </TooltipContent>
          </Tooltip>
        ) : null}

        {hasOrphaned ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {counts.orphaned} orphaned
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {counts.orphaned} entity reference{counts.orphaned !== 1 ? 's' : ''} no longer exist in Knowledge Base
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    );
  },
);

SceneEntitySummary.displayName = 'SceneEntitySummary';

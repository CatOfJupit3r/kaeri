import { memo, useCallback, useState } from 'react';
import { LuCheck, LuLink, LuPlus, LuX } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@~/components/ui/popover';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { cn } from '@~/lib/utils';

export interface iStoryArc {
  _id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface iSceneArcLinkerProps {
  /** Currently linked arc IDs */
  linkedArcIds: string[];
  /** Available story arcs to link */
  availableArcs: iStoryArc[];
  /** Loading state for arcs */
  isLoading?: boolean;
  /** Called when arc is linked */
  onLink?: (arcId: string) => void;
  /** Called when arc is unlinked */
  onUnlink?: (arcId: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

// Type alias for external use
export type SceneArcLinkerProps = iSceneArcLinkerProps;
export type StoryArc = iStoryArc;

/**
 * Scene Arc Linker
 *
 * Allows linking a scene to one or more story arcs from the Knowledge Base.
 * Shows linked arcs as badges with ability to add/remove.
 */
export const SceneArcLinker = memo(
  ({
    linkedArcIds,
    availableArcs,
    isLoading = false,
    onLink,
    onUnlink,
    className,
    disabled = false,
  }: iSceneArcLinkerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const linkedArcs = availableArcs.filter((arc) => linkedArcIds.includes(arc._id));
    const unlinkedArcs = availableArcs.filter((arc) => !linkedArcIds.includes(arc._id));

    const handleSelect = useCallback(
      (arcId: string) => {
        if (linkedArcIds.includes(arcId)) {
          onUnlink?.(arcId);
        } else {
          onLink?.(arcId);
        }
      },
      [linkedArcIds, onLink, onUnlink],
    );

    const handleRemove = useCallback(
      (arcId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onUnlink?.(arcId);
      },
      [onUnlink],
    );

    return (
      <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
        {/* Linked Arcs */}
        {linkedArcs.map((arc) => (
          <Badge
            key={arc._id}
            variant="outline"
            className="gap-1 pr-1"
            style={arc.color ? { borderColor: arc.color, color: arc.color } : undefined}
          >
            <LuLink className="size-3" />
            {arc.name}
            {!disabled && (
              <Button
                size="icon"
                variant="ghost"
                className="ml-0.5 size-4 rounded-full p-0 hover:bg-destructive/20"
                onClick={(e) => handleRemove(arc._id, e)}
              >
                <LuX className="size-3" />
              </Button>
            )}
          </Badge>
        ))}

        {/* Add Arc Button */}
        {!disabled ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-xs" disabled={isLoading}>
                <LuPlus className="size-3" />
                Link Arc
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2" align="start">
              <ScrollArea className="max-h-[200px]">
                {isLoading ? <p className="py-2 text-center text-xs text-muted-foreground">Loading arcs...</p> : null}
                {!isLoading && availableArcs.length === 0 ? (
                  <p className="py-2 text-center text-xs text-muted-foreground">No story arcs found.</p>
                ) : null}
                {!isLoading && availableArcs.length > 0 ? (
                  <div className="space-y-1">
                    {linkedArcs.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Linked</p>
                        {linkedArcs.map((arc) => (
                          <Button
                            key={arc._id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-xs"
                            onClick={() => handleSelect(arc._id)}
                          >
                            <LuCheck className="size-4 text-primary" />
                            {arc.name}
                          </Button>
                        ))}
                      </div>
                    )}
                    {unlinkedArcs.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Available</p>
                        {unlinkedArcs.map((arc) => (
                          <Button
                            key={arc._id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-xs"
                            onClick={() => handleSelect(arc._id)}
                          >
                            <span className="size-4" />
                            {arc.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        ) : null}

        {linkedArcs.length === 0 && disabled ? (
          <span className="text-xs text-muted-foreground">No arcs linked</span>
        ) : null}
      </div>
    );
  },
);

SceneArcLinker.displayName = 'SceneArcLinker';

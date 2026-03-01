import { memo, useCallback, useState } from 'react';
import { LuCalendar, LuCheck, LuLink, LuX } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@~/components/ui/popover';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { cn } from '@~/lib/utils';

export interface iTimelineEntry {
  _id: string;
  label: string;
  date?: string;
  description?: string;
}

export interface iSceneTimelineLinkerProps {
  /** Currently linked timeline entry ID (one per scene) */
  linkedEntryId?: string;
  /** Available timeline entries to link */
  availableEntries: iTimelineEntry[];
  /** Loading state for entries */
  isLoading?: boolean;
  /** Called when entry is linked */
  onLink?: (entryId: string) => void;
  /** Called when entry is unlinked */
  onUnlink?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

// Type alias for external use
export type SceneTimelineLinkerProps = iSceneTimelineLinkerProps;
export type TimelineEntry = iTimelineEntry;

/**
 * Scene Timeline Linker
 *
 * Links a scene to a specific timeline entry for chronological ordering.
 * Only one timeline entry per scene (unlike arcs which can be many-to-many).
 */
export const SceneTimelineLinker = memo(
  ({
    linkedEntryId,
    availableEntries,
    isLoading = false,
    onLink,
    onUnlink,
    className,
    disabled = false,
  }: iSceneTimelineLinkerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const linkedEntry = linkedEntryId ? availableEntries.find((entry) => entry._id === linkedEntryId) : undefined;

    const handleSelect = useCallback(
      (entryId: string) => {
        if (entryId === linkedEntryId) {
          onUnlink?.();
        } else {
          onLink?.(entryId);
        }
        setIsOpen(false);
      },
      [linkedEntryId, onLink, onUnlink],
    );

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onUnlink?.();
      },
      [onUnlink],
    );

    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        {linkedEntry ? (
          <Badge variant="outline" className="gap-1 pr-1">
            <LuCalendar className="size-3" />
            {linkedEntry.label}
            {linkedEntry.date ? <span className="text-muted-foreground">({linkedEntry.date})</span> : null}
            {!disabled && (
              <Button
                size="icon"
                variant="ghost"
                className="ml-0.5 size-4 rounded-full p-0 hover:bg-destructive/20"
                onClick={handleRemove}
              >
                <LuX className="size-3" />
              </Button>
            )}
          </Badge>
        ) : (
          !disabled && (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-xs" disabled={isLoading}>
                  <LuLink className="size-3" />
                  Link to Timeline
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-2" align="start">
                <ScrollArea className="max-h-[200px]">
                  {isLoading ? (
                    <p className="py-2 text-center text-xs text-muted-foreground">Loading timeline...</p>
                  ) : null}
                  {!isLoading && availableEntries.length === 0 ? (
                    <p className="py-2 text-center text-xs text-muted-foreground">No timeline entries found.</p>
                  ) : null}
                  {!isLoading && availableEntries.length > 0 ? (
                    <div className="space-y-1">
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Timeline Entries</p>
                      {availableEntries.map((entry) => (
                        <Button
                          key={entry._id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-xs"
                          onClick={() => handleSelect(entry._id)}
                        >
                          {entry._id === linkedEntryId ? (
                            <LuCheck className="size-4 text-primary" />
                          ) : (
                            <LuCalendar className="size-4 text-muted-foreground" />
                          )}
                          <div className="flex flex-col items-start">
                            <span>{entry.label}</span>
                            {entry.date ? <span className="text-xs text-muted-foreground">{entry.date}</span> : null}
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )
        )}

        {!linkedEntry && disabled ? (
          <span className="text-xs text-muted-foreground">Not linked to timeline</span>
        ) : null}
      </div>
    );
  },
);

SceneTimelineLinker.displayName = 'SceneTimelineLinker';

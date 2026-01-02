import { useMemo, useState } from 'react';
import { LuCalendar, LuPencil, LuTrash2 } from 'react-icons/lu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@~/components/ui/alert-dialog';
import { Button } from '@~/components/ui/button';
import { Card, CardContent } from '@~/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@~/components/ui/empty';
import { useTimelineList } from '@~/features/timelines/hooks/queries/use-timeline-list';

import { useDeleteTimeline } from '../hooks/mutations/use-delete-timeline';
import { TimelineForm } from './timeline-form';

interface iTimelineEntry {
  _id: string;
  label: string;
  timestamp?: string;
  order?: number;
}

interface iTimelineListProps {
  seriesId: string;
}

export function TimelineList({ seriesId }: iTimelineListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<iTimelineEntry | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<iTimelineEntry | undefined>(undefined);
  const { data, isLoading, error } = useTimelineList(seriesId);
  const { deleteTimeline, isPending: isDeleting } = useDeleteTimeline();

  const sortedEntries = useMemo(() => {
    const entries = data?.items ?? [];
    return [...entries].sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (a.timestamp && !b.timestamp) return -1;
      if (!a.timestamp && b.timestamp) return 1;
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return 0;
    });
  }, [data?.items]);

  const handleEditClick = (entry: iTimelineEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (entry: iTimelineEntry) => {
    setEntryToDelete(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      deleteTimeline(
        { id: entryToDelete._id, seriesId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setEntryToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingEntry(undefined);
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Error loading timeline: {error.message}</p>
      </div>
    );
  }

  if (sortedEntries.length === 0) {
    return (
      <>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LuCalendar />
            </EmptyMedia>
            <EmptyTitle>No timeline entries yet</EmptyTitle>
            <EmptyDescription>Create your first timeline entry to start tracking story events.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsFormOpen(true)}>New Timeline Entry</Button>
          </EmptyContent>
        </Empty>
        <TimelineForm seriesId={seriesId} open={isFormOpen} onOpenChange={handleFormOpenChange} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} {data?.total === 1 ? 'entry' : 'entries'}
          </p>
          <Button onClick={() => setIsFormOpen(true)}>New Timeline Entry</Button>
        </div>

        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const formattedDate = formatDate(entry.timestamp);

            return (
              <Card key={entry._id} className="group overflow-hidden transition-all hover:shadow-md">
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {formattedDate ? (
                        <span className="flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground">
                          <LuCalendar className="size-4" />
                          {formattedDate}
                        </span>
                      ) : null}
                      <h3 className="truncate font-semibold text-foreground group-hover:text-primary">{entry.label}</h3>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(entry);
                      }}
                      className="size-8 p-0"
                    >
                      <LuPencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(entry);
                      }}
                      className="size-8 p-0 text-destructive hover:text-destructive"
                    >
                      <LuTrash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <TimelineForm
        seriesId={seriesId}
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        initialData={editingEntry}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timeline Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{entryToDelete?.label}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useState } from 'react';
import { LuPencil, LuTrash2, LuTrendingUp } from 'react-icons/lu';

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
import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent } from '@~/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@~/components/ui/empty';
import { Progress } from '@~/components/ui/progress';
import { Skeleton } from '@~/components/ui/skeleton';
import { ListErrorState, ListPendingState } from '@~/features/knowledge-base/components/list-states';

import { useDeleteStoryArc } from '../hooks/mutations/use-delete-story-arc';
import type { StoryArcListItem } from '../hooks/queries/use-story-arc-list';
import { useStoryArcList } from '../hooks/queries/use-story-arc-list';
import { StoryArcForm } from './story-arc-form';

interface iStoryArcListProps {
  seriesId: string;
}

function StoryArcListPending() {
  return (
    <ListPendingState>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => {
          const key = `skeleton-arc-${index}`;
          return (
            <Card key={key} className="overflow-hidden">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ListPendingState>
  );
}

const STATUS_COLORS = {
  planned: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  completed: 'bg-green-500/10 text-green-500 border-green-500/30',
  abandoned: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
} as const;

const STATUS_LABELS = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  abandoned: 'Abandoned',
} as const;

export function StoryArcList({ seriesId }: iStoryArcListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStoryArc, setEditingStoryArc] = useState<StoryArcListItem | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [storyArcToDelete, setStoryArcToDelete] = useState<StoryArcListItem | undefined>(undefined);
  const { data, isPending, error } = useStoryArcList(seriesId);
  const { deleteStoryArc, isPending: isDeleting } = useDeleteStoryArc();

  const handleEditClick = (e: React.MouseEvent, storyArc: StoryArcListItem) => {
    e.stopPropagation();
    setEditingStoryArc(storyArc);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, storyArc: StoryArcListItem) => {
    e.stopPropagation();
    setStoryArcToDelete(storyArc);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (storyArcToDelete) {
      deleteStoryArc(
        { storyArcId: storyArcToDelete._id },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setStoryArcToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingStoryArc(undefined);
    }
  };

  const calculateProgress = (arc: StoryArcListItem): number => {
    if (arc.keyBeats.length === 0) return 0;
    return Math.round((arc.keyBeats.length / (arc.keyBeats.length + 2)) * 100);
  };

  if (isPending) {
    return <StoryArcListPending />;
  }

  if (error) {
    return <ListErrorState message={error.message} />;
  }

  const storyArcs = data?.items ?? [];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{storyArcs.length} story arcs</p>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            Create Story Arc
          </Button>
        </div>

        {storyArcs.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <LuTrendingUp className="size-12" />
              </EmptyMedia>
              <EmptyTitle>No story arcs yet</EmptyTitle>
              <EmptyDescription>Create your first story arc to track narrative progression.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setIsFormOpen(true)}>Create Story Arc</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {storyArcs.map((arc) => {
              const progress = calculateProgress(arc);
              return (
                <Card
                  key={arc._id}
                  className="group cursor-pointer overflow-hidden transition-colors hover:bg-accent/50"
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                          <LuTrendingUp className="size-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="line-clamp-1 font-semibold text-foreground">{arc.name}</h3>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0"
                          onClick={(e) => handleEditClick(e, arc)}
                        >
                          <LuPencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => handleDeleteClick(e, arc)}
                        >
                          <LuTrash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <Badge variant="outline" className={STATUS_COLORS[arc.status]}>
                      {STATUS_LABELS[arc.status]}
                    </Badge>

                    <p className="line-clamp-2 text-sm text-muted-foreground">{arc.description}</p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    {arc.characters.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{arc.characters.length} character(s)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <StoryArcForm
        seriesId={seriesId}
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        initialData={editingStoryArc}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story Arc</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{storyArcToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useState } from 'react';
import { LuBookOpen, LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';

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
import { Skeleton } from '@~/components/ui/skeleton';
import { ListErrorState, ListPendingState } from '@~/features/knowledge-base/components/list-states';

import { useDeleteResearch } from '../hooks/mutations/use-delete-research';
import type { ResearchListItem } from '../hooks/queries/use-research-list';
import { useResearchList } from '../hooks/queries/use-research-list';
import { ResearchCreateForm } from './research-create-form';

interface iResearchListProps {
  seriesId: string;
  onResearchSelect?: (researchId: string) => void;
}

function ResearchListPending() {
  return (
    <ListPendingState>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-5 flex-1" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ListPendingState>
  );
}

export function ResearchList({ seriesId, onResearchSelect }: iResearchListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [researchToDelete, setResearchToDelete] = useState<ResearchListItem | undefined>(undefined);
  const { data, isPending, error, refetch } = useResearchList(seriesId);
  const { mutate: deleteResearch, isPending: isDeleting } = useDeleteResearch();

  const handleCardClick = (research: ResearchListItem) => {
    onResearchSelect?.(research._id);
  };

  const handleDeleteClick = (research: ResearchListItem) => {
    setResearchToDelete(research);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (researchToDelete) {
      deleteResearch(
        { researchId: researchToDelete._id },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setResearchToDelete(undefined);
          },
        },
      );
    }
  };

  if (isPending) {
    return <ResearchListPending />;
  }

  if (error) {
    return (
      <ListErrorState
        message={error.message}
        onRetry={async () => {
          await refetch();
        }}
      />
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-end">
          <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)}>
            <LuPlus className="mr-2 size-4" />
            New Research
          </Button>
        </div>

        <Empty>
          <EmptyMedia>
            <LuSearch className="size-10" />
          </EmptyMedia>
          <EmptyContent>
            <EmptyHeader>
              <EmptyTitle>No Research Notes</EmptyTitle>
              <EmptyDescription>Start documenting your research to keep track of reference materials.</EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>

        <ResearchCreateForm seriesId={seriesId} open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} research entries</p>
        <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)}>
          <LuPlus className="mr-2 size-4" />
          New Research
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((research) => (
          <Card
            key={research._id}
            className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
            onClick={() => handleCardClick(research)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <LuBookOpen className="size-4" />
                  </div>
                  <h3 className="truncate font-medium">{research.title}</h3>
                </div>

                {research.content ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{research.content.slice(0, 150)}</p>
                ) : null}

                {research.tags && research.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {research.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {research.tags.length > 3 ? (
                      <Badge variant="outline" className="text-xs">
                        +{research.tags.length - 3}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResearchSelect?.(research._id);
                    }}
                  >
                    <LuPencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(research);
                    }}
                  >
                    <LuTrash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ResearchCreateForm seriesId={seriesId} open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Research Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{researchToDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

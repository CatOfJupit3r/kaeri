import { useState } from 'react';
import { LuPencil, LuSparkles, LuTrash2 } from 'react-icons/lu';

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
import { useWildcardList } from '@~/features/wildcards/hooks/queries/use-wildcard-list';

import { useDeleteWildcard } from '../hooks/mutations/use-delete-wildcard';
import { WildcardForm } from './wildcard-form';

interface iWildcard {
  _id: string;
  title: string;
  body?: string;
  tag?: string;
}

interface iWildcardListProps {
  seriesId: string;
}

export function WildcardList({ seriesId }: iWildcardListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWildcard, setEditingWildcard] = useState<iWildcard | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wildcardToDelete, setWildcardToDelete] = useState<iWildcard | undefined>(undefined);
  const { data, isPending, error } = useWildcardList(seriesId);
  const { deleteWildcard, isPending: isDeleting } = useDeleteWildcard();

  const handleEditClick = (wildcard: iWildcard) => {
    setEditingWildcard(wildcard);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (wildcard: iWildcard) => {
    setWildcardToDelete(wildcard);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (wildcardToDelete) {
      deleteWildcard(
        { id: wildcardToDelete._id, seriesId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setWildcardToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingWildcard(undefined);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading Wild Cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Error loading Wild Cards: {error.message}</p>
      </div>
    );
  }

  const wildcards = data?.items ?? [];

  if (wildcards.length === 0) {
    return (
      <>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LuSparkles />
            </EmptyMedia>
            <EmptyTitle>No Wild Cards yet</EmptyTitle>
            <EmptyDescription>Create your first Wild Card to store miscellaneous notes and ideas.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsFormOpen(true)}>New Wild Card</Button>
          </EmptyContent>
        </Empty>
        <WildcardForm
          seriesId={seriesId}
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          initialData={editingWildcard}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} {data?.total === 1 ? 'Wild Card' : 'Wild Cards'}
          </p>
          <Button onClick={() => setIsFormOpen(true)}>New Wild Card</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wildcards.map((wildcard) => (
            <Card key={wildcard._id} className="group overflow-hidden transition-all hover:shadow-md">
              <CardContent className="flex gap-4 p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                  <LuSparkles className="size-6 text-muted-foreground" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
                      {wildcard.title}
                    </h3>
                    {wildcard.tag ? (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {wildcard.tag}
                      </Badge>
                    ) : null}
                  </div>
                  {wildcard.body ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{wildcard.body}</p>
                  ) : null}

                  <div className="mt-2 flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(wildcard);
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
                        handleDeleteClick(wildcard);
                      }}
                      className="size-8 p-0 text-destructive hover:text-destructive"
                    >
                      <LuTrash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <WildcardForm
        seriesId={seriesId}
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        initialData={editingWildcard}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wild Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{wildcardToDelete?.title}&quot;? This action cannot be undone.
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

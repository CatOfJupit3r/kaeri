import { useState } from 'react';
import { LuPackage, LuPencil, LuTrash2 } from 'react-icons/lu';

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
import { usePropList } from '@~/features/knowledge-base/hooks/queries/use-prop-list';

import { useDeleteProp } from '../hooks/mutations/use-delete-prop';
import { PropForm } from './prop-form';

interface iProp {
  _id: string;
  name: string;
  description?: string;
  associations?: Array<{
    characterId?: string;
    locationId?: string;
    scriptId?: string;
    note?: string;
  }>;
}

interface iPropListProps {
  seriesId: string;
}

export function PropList({ seriesId }: iPropListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<iProp | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propToDelete, setPropToDelete] = useState<iProp | undefined>(undefined);
  const { data, isLoading, error } = usePropList(seriesId);
  const { deleteProp, isPending: isDeleting } = useDeleteProp();

  const handleEditClick = (prop: iProp) => {
    setEditingProp(prop);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (prop: iProp) => {
    setPropToDelete(prop);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (propToDelete) {
      deleteProp(
        { id: propToDelete._id, seriesId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setPropToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingProp(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading props...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Error loading props: {error.message}</p>
      </div>
    );
  }

  const props = data?.items ?? [];

  if (props.length === 0) {
    return (
      <>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LuPackage />
            </EmptyMedia>
            <EmptyTitle>No props yet</EmptyTitle>
            <EmptyDescription>Create your first prop to start building your story&apos;s inventory.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsFormOpen(true)}>New Prop</Button>
          </EmptyContent>
        </Empty>
        <PropForm seriesId={seriesId} open={isFormOpen} onOpenChange={handleFormOpenChange} initialData={editingProp} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} {data?.total === 1 ? 'prop' : 'props'}
          </p>
          <Button onClick={() => setIsFormOpen(true)}>New Prop</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {props.map((prop) => {
            const associationCount = prop.associations?.length ?? 0;

            return (
              <Card key={prop._id} className="group overflow-hidden transition-all hover:shadow-md">
                <CardContent className="flex gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                    <LuPackage className="size-6 text-muted-foreground" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="truncate font-semibold text-foreground group-hover:text-primary">{prop.name}</h3>
                    {prop.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{prop.description}</p>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          {associationCount} {associationCount === 1 ? 'association' : 'associations'}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(prop);
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
                            handleDeleteClick(prop);
                          }}
                          className="size-8 p-0 text-destructive hover:text-destructive"
                        >
                          <LuTrash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <PropForm seriesId={seriesId} open={isFormOpen} onOpenChange={handleFormOpenChange} initialData={editingProp} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{propToDelete?.name}&quot;? This action cannot be undone.
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

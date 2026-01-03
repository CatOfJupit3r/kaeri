import { useState } from 'react';
import { LuGlobe, LuPencil, LuTrash2 } from 'react-icons/lu';

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
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';

import { useDeleteLocation } from '../hooks/mutations/use-delete-location';
import { LocationForm } from './location-form';

interface iLocation {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
}

interface iLocationListProps {
  seriesId: string;
}

function LocationListPending() {
  return (
    <ListPendingState>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Card key={index} className="overflow-hidden">
            <CardContent className="flex gap-4 p-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ListPendingState>
  );
}

export function LocationList({ seriesId }: iLocationListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<iLocation | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<iLocation | undefined>(undefined);
  const { data, isPending, error, refetch } = useLocationList(seriesId);
  const { deleteLocation, isPending: isDeleting } = useDeleteLocation();

  const handleEditClick = (location: iLocation) => {
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (location: iLocation) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (locationToDelete) {
      deleteLocation(
        { id: locationToDelete._id, seriesId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setLocationToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingLocation(undefined);
    }
  };

  if (isPending) {
    return <LocationListPending />;
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-void
    return <ListErrorState message={`Error loading locations: ${message}`} onRetry={() => void refetch()} />;
  }

  const locations = data?.items ?? [];

  if (locations.length === 0) {
    return (
      <>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LuGlobe />
            </EmptyMedia>
            <EmptyTitle>No locations yet</EmptyTitle>
            <EmptyDescription>Create your first location to start mapping your story&apos;s world.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsFormOpen(true)}>New Location</Button>
          </EmptyContent>
        </Empty>
        <LocationForm
          seriesId={seriesId}
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          initialData={editingLocation}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} {data?.total === 1 ? 'location' : 'locations'}
          </p>
          <Button onClick={() => setIsFormOpen(true)}>New Location</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => {
            const tagCount = location.tags?.length ?? 0;

            return (
              <Card key={location._id} className="group overflow-hidden transition-all hover:shadow-md">
                <CardContent className="flex gap-4 p-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <LuGlobe className="size-6 text-muted-foreground" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="truncate font-semibold text-foreground group-hover:text-primary">{location.name}</h3>
                    {location.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{location.description}</p>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-1">
                        {location.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tagCount > 2 ? (
                          <Badge variant="secondary" className="text-xs">
                            +{tagCount - 2}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(location);
                          }}
                          className="size-8 p-0"
                          aria-label={`Edit ${location.name}`}
                        >
                          <LuPencil className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(location);
                          }}
                          className="size-8 p-0 text-destructive hover:text-destructive"
                          aria-label={`Delete ${location.name}`}
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
      <LocationForm
        seriesId={seriesId}
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        initialData={editingLocation}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{locationToDelete?.name}&quot;? This action cannot be undone.
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

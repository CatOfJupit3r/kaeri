import { useState } from 'react';
import { LuLightbulb, LuPencil, LuTrash2 } from 'react-icons/lu';

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

import { useDeleteTheme } from '../hooks/mutations/use-delete-theme';
import type { ThemeListItem } from '../hooks/queries/use-theme-list';
import { useThemeList } from '../hooks/queries/use-theme-list';
import { ThemeForm } from './theme-form';

interface iThemeListProps {
  seriesId: string;
}

function ThemeListPending() {
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
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-1">
                    <Skeleton className="size-8" />
                    <Skeleton className="size-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ListPendingState>
  );
}

export function ThemeList({ seriesId }: iThemeListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeListItem | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<ThemeListItem | undefined>(undefined);
  const { data, isPending, error, refetch } = useThemeList(seriesId);
  const { deleteTheme, isPending: isDeleting } = useDeleteTheme();

  const handleCardClick = (themeId: string) => {
    // Navigation to detail view - route will be generated when running dev server
    console.log('Navigate to theme:', themeId);
    // void navigate({
    //   to: '/series/$seriesId/knowledge-base/themes/$themeId',
    //   params: { seriesId, themeId },
    //   search: { tab: 'themes' },
    // });
  };

  const handleEditClick = (theme: ThemeListItem) => {
    setEditingTheme(theme);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (theme: ThemeListItem) => {
    setThemeToDelete(theme);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (themeToDelete) {
      deleteTheme(
        { themeId: themeToDelete._id },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setThemeToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingTheme(undefined);
    }
  };

  if (isPending) {
    return <ThemeListPending />;
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return <ListErrorState message={`Error loading themes: ${message}`} onRetry={async () => refetch().then()} />;
  }

  const themes = data?.items ?? [];

  if (themes.length === 0) {
    return (
      <>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LuLightbulb />
            </EmptyMedia>
            <EmptyTitle>No themes yet</EmptyTitle>
            <EmptyDescription>Create your first theme to start tracking story motifs and patterns.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsFormOpen(true)}>New Theme</Button>
          </EmptyContent>
        </Empty>
        <ThemeForm
          seriesId={seriesId}
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          initialData={editingTheme}
        />
      </>
    );
  }

  const getColorClass = (color?: string) => {
    if (!color) return 'bg-gray-500/10 text-gray-500';

    const colorMap: Record<string, string> = {
      red: 'bg-red-500/10 text-red-500',
      orange: 'bg-orange-500/10 text-orange-500',
      yellow: 'bg-yellow-500/10 text-yellow-500',
      green: 'bg-green-500/10 text-green-500',
      blue: 'bg-blue-500/10 text-blue-500',
      indigo: 'bg-indigo-500/10 text-indigo-500',
      purple: 'bg-purple-500/10 text-purple-500',
      pink: 'bg-pink-500/10 text-pink-500',
    };

    return colorMap[color] ?? 'bg-gray-500/10 text-gray-500';
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} {data?.total === 1 ? 'theme' : 'themes'}
          </p>
          <Button onClick={() => setIsFormOpen(true)}>New Theme</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => {
            const occurrenceCount = theme.appearances?.length ?? 0;
            const colorClass = getColorClass(theme.color);

            return (
              <Card
                key={theme._id}
                className="group overflow-hidden transition-all hover:shadow-md"
                role="button"
                tabIndex={0}
                aria-label={`Open theme ${theme.name}`}
                onClick={() => handleCardClick(theme._id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleCardClick(theme._id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                        <LuLightbulb className="size-4" />
                      </div>
                      <h3 className="truncate font-semibold text-foreground group-hover:text-primary">{theme.name}</h3>
                    </div>

                    {theme.description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{theme.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No description</p>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {occurrenceCount} {occurrenceCount === 1 ? 'occurrence' : 'occurrences'}
                        </Badge>
                        {theme.color ? (
                          <Badge variant="outline" className="text-xs">
                            {theme.color}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(theme);
                          }}
                          className="size-8 p-0"
                          aria-label={`Edit ${theme.name}`}
                        >
                          <LuPencil className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(theme);
                          }}
                          className="size-8 p-0 text-destructive hover:text-destructive"
                          aria-label={`Delete ${theme.name}`}
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
      <ThemeForm seriesId={seriesId} open={isFormOpen} onOpenChange={handleFormOpenChange} initialData={editingTheme} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{themeToDelete?.name}&quot;? This action cannot be undone.
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

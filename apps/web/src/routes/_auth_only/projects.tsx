import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { LuEllipsisVertical, LuPencil, LuTrash2 } from 'react-icons/lu';

import { SeriesError } from '@~/components/errors/series-error';
import { SeriesEmptyState } from '@~/components/loading/series-empty-state';
import { SeriesSkeleton } from '@~/components/loading/series-skeleton';
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
import { Card } from '@~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';
import { SeriesModal } from '@~/features/series/components/series-modal';
import { useDeleteSeries } from '@~/features/series/hooks/mutations/use-delete-series';
import { useSeriesList } from '@~/features/series/hooks/queries/use-series-list';

export const Route = createFileRoute('/_auth_only/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<{
    _id: string;
    title: string;
    genre?: string;
    logline?: string;
    coverUrl?: string;
  } | null>(null);
  const [deletingSeriesId, setDeletingSeriesId] = useState<string | null>(null);
  const { data: seriesListData, isPending, error, refetch } = useSeriesList();
  const { deleteSeries, isPending: isDeleting } = useDeleteSeries();

  const handleEdit = (series: typeof editingSeries) => {
    setEditingSeries(series);
    setIsModalOpen(true);
  };

  const handleDelete = (seriesId: string) => {
    setDeletingSeriesId(seriesId);
  };

  const confirmDelete = () => {
    if (deletingSeriesId) {
      deleteSeries(
        { seriesId: deletingSeriesId },
        {
          onSettled: () => {
            setDeletingSeriesId(null);
          },
        },
      );
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingSeries(null);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
              <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
            </div>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
              <span>New Project</span>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <SeriesSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
              <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
            </div>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
              <span>New Project</span>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <SeriesError
            error={error}
            onRetry={() => {
              refetch().catch(console.error);
            }}
          />
        </div>
      </div>
    );
  }

  const series = seriesListData?.items ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
          </div>

          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <span>New Project</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        {series.length === 0 ? (
          <SeriesEmptyState onCreateClick={() => setIsModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => (
              <Card key={s._id} className="group overflow-hidden transition-all hover:shadow-md">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/series/$seriesId" params={{ seriesId: s._id }} className="flex-1 cursor-pointer">
                      <h3 className="font-semibold text-foreground group-hover:text-primary">{s.title}</h3>
                      {s.genre ? <p className="text-xs text-muted-foreground">{s.genre}</p> : null}
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                          <LuEllipsisVertical className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleEdit({
                              _id: s._id,
                              title: s.title,
                              genre: s.genre,
                              logline: s.logline,
                              coverUrl: s.coverUrl,
                            })
                          }
                        >
                          <LuPencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(s._id)}>
                          <LuTrash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {s.logline ? <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.logline}</p> : null}
                  <div className="mt-4 text-xs text-muted-foreground">
                    Last edited: {new Date(s.lastEditedAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SeriesModal open={isModalOpen} onOpenChange={handleModalClose} initialData={editingSeries ?? undefined} />

      <AlertDialog open={!!deletingSeriesId} onOpenChange={(open) => !open && setDeletingSeriesId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will permanently remove the
              series and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

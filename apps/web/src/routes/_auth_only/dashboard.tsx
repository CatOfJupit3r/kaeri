import { useHotkey } from '@tanstack/react-hotkeys';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { GiHoneyJar } from 'react-icons/gi';
import { LuEllipsisVertical, LuFileText, LuFilm, LuLibrary, LuPencil, LuTrash2, LuTv } from 'react-icons/lu';

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
import { IS_DEVELOPMENT } from '@~/constants';
import { SeriesModal } from '@~/features/series/components/series-modal';
import { useDeleteSeries } from '@~/features/series/hooks/mutations/use-delete-series';
import { seriesListQueryOptions, useSeriesList } from '@~/features/series/hooks/queries/use-series-list';
import { useCreateBeeMovie } from '@~/hooks/use-create-bee-movie';

// Series type configuration
const SERIES_TYPE_CONFIG = {
  'tv-series': { label: 'TV Series', icon: LuTv, color: 'bg-blue-100 text-blue-700' },
  'film-trilogy': { label: 'Film Trilogy', icon: LuFilm, color: 'bg-pink-100 text-pink-700' },
  anthology: { label: 'Anthology', icon: LuLibrary, color: 'bg-yellow-100 text-yellow-700' },
  standalone: { label: 'Standalone', icon: LuFileText, color: 'bg-green-100 text-green-700' },
} as const;

type SeriesType = keyof typeof SERIES_TYPE_CONFIG;

export const Route = createFileRoute('/_auth_only/dashboard')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(seriesListQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<{
    _id: string;
    title: string;
    type?: SeriesType;
    genre?: string;
    logline?: string;
    coverUrl?: string;
  } | null>(null);
  const [deletingSeriesId, setDeletingSeriesId] = useState<string | null>(null);
  const { data: seriesListData, isPending, error, refetch } = useSeriesList();
  const { deleteSeries, isPending: isDeleting } = useDeleteSeries();
  const { createBeeMovieData, isPending: isCreatingBeeMovie } = useCreateBeeMovie();

  const handleNewProject = useCallback(() => {
    setEditingSeries(null);
    setIsModalOpen(true);
  }, []);

  // Keyboard shortcut: Mod+N to create new project
  useHotkey('Mod+N', handleNewProject, { preventDefault: true });

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
      <div className="h-full overflow-auto bg-background">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
              <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
            </div>
            <Button data-testid="create-series-button" className="gap-2" onClick={handleNewProject}>
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
      <div className="h-full overflow-auto bg-background">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
              <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
            </div>
            <Button data-testid="create-series-button" className="gap-2" onClick={handleNewProject}>
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
    <div className="h-full overflow-auto bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
          </div>

          <Button data-testid="create-series-button" className="gap-2" onClick={handleNewProject}>
            <span>New Project</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        {series.length === 0 ? (
          <SeriesEmptyState onCreateClick={handleNewProject} />
        ) : (
          <div data-testid="series-grid" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => (
              <Card
                key={s._id}
                data-testid="series-card"
                className="group overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/series/$seriesId" params={{ seriesId: s._id }} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        {/* Series Type Icon */}
                        {s.type && SERIES_TYPE_CONFIG[s.type] ? (
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${SERIES_TYPE_CONFIG[s.type].color}`}
                          >
                            {(() => {
                              const Icon = SERIES_TYPE_CONFIG[s.type].icon;
                              return <Icon className="h-4 w-4" />;
                            })()}
                          </div>
                        ) : null}
                        <div>
                          <h3
                            data-testid="series-card-title"
                            className="font-semibold text-foreground group-hover:text-primary"
                          >
                            {s.title}
                          </h3>
                          {s.genre ? <p className="text-xs text-muted-foreground">{s.genre}</p> : null}
                        </div>
                      </div>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button data-testid="series-card-menu" variant="ghost" size="sm" className="size-8 p-0">
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
                              type: s.type as SeriesType | undefined,
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
      {/* Secret Bee Movie Button - Subtle but discoverable (dev only) */}
      {IS_DEVELOPMENT ? (
        <Button
          onClick={() => createBeeMovieData()}
          disabled={isCreatingBeeMovie}
          size="icon"
          variant="ghost"
          className="fixed bottom-4 left-4 size-10 opacity-20 transition-all hover:scale-110 hover:opacity-100"
          title={isCreatingBeeMovie ? 'Creating Bee Movie data...' : 'Create Bee Movie example data (dev only)'}
        >
          <GiHoneyJar className="size-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

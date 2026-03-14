import { useState } from 'react';
import { LuCheck, LuCircleDashed, LuEllipsisVertical, LuPencil, LuPlay, LuPlus, LuTrash2 } from 'react-icons/lu';

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
import { Card } from '@~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';
import { cn } from '@~/lib/utils';

import { useDeleteEpisode } from '../hooks/mutations/use-delete-episode';
import { useEpisodeList } from '../hooks/queries/use-episode-list';
import { EpisodeModal } from './episode-modal';

// Episode status configuration
const EPISODE_STATUS_CONFIG = {
  outline: { label: 'Outline', icon: LuCircleDashed, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  in_progress: { label: 'In Progress', icon: LuPlay, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  complete: { label: 'Complete', icon: LuCheck, color: 'bg-green-100 text-green-700 border-green-300' },
} as const;

type EpisodeStatus = keyof typeof EPISODE_STATUS_CONFIG;

interface iEpisode {
  _id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description?: string;
  scriptIds: string[];
  status: EpisodeStatus;
  airDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface iEpisodeListProps {
  seriesId: string;
  seasonNumber?: number;
}

export function EpisodeList({ seriesId, seasonNumber }: iEpisodeListProps) {
  const { data, isPending, error } = useEpisodeList(seriesId, seasonNumber);
  const { deleteEpisode, isPending: isDeleting } = useDeleteEpisode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<iEpisode | null>(null);
  const [deletingEpisodeId, setDeletingEpisodeId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingEpisode(null);
    setIsModalOpen(true);
  };

  const handleEdit = (episode: iEpisode) => {
    setEditingEpisode(episode);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingEpisodeId) {
      deleteEpisode(
        { episodeId: deletingEpisodeId },
        {
          onSettled: () => setDeletingEpisodeId(null),
        },
      );
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading episodes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Failed to load episodes</div>
      </div>
    );
  }

  const episodes = (data?.items ?? []) as unknown as iEpisode[];

  // Group by season
  const seasons = episodes.reduce<Record<number, iEpisode[]>>((acc, ep) => {
    const season = ep.seasonNumber;
    if (!acc[season]) acc[season] = [];
    acc[season].push(ep);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Episodes</h2>
        <Button onClick={handleCreate} size="sm" className="gap-2">
          <LuPlus className="h-4 w-4" />
          Add Episode
        </Button>
      </div>

      {episodes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No episodes yet</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4 gap-2">
            <LuPlus className="h-4 w-4" />
            Create First Episode
          </Button>
        </Card>
      ) : (
        Object.entries(seasons)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([season, eps]) => (
            <div key={season} className="space-y-3">
              <h3 className="font-medium text-muted-foreground">Season {season}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {eps
                  .sort((a, b) => a.episodeNumber - b.episodeNumber)
                  .map((episode) => {
                    const statusConfig = EPISODE_STATUS_CONFIG[episode.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <Card key={episode._id} className="group p-4 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-muted-foreground">
                                E{String(episode.episodeNumber).padStart(2, '0')}
                              </span>
                              <h4 className="truncate font-medium">{episode.title}</h4>
                            </div>
                            {episode.description ? (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{episode.description}</p>
                            ) : null}
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className={cn('gap-1 text-xs', statusConfig.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                              {episode.scriptIds.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {episode.scriptIds.length} script{episode.scriptIds.length === 1 ? '' : 's'}
                                </span>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <LuEllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(episode)}>
                                <LuPencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => setDeletingEpisodeId(episode._id)}>
                                <LuTrash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))
      )}

      <EpisodeModal open={isModalOpen} onOpenChange={setIsModalOpen} seriesId={seriesId} initialData={editingEpisode} />

      <AlertDialog open={!!deletingEpisodeId} onOpenChange={(open) => !open && setDeletingEpisodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Episode</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this episode? This action cannot be undone.
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
    </div>
  );
}

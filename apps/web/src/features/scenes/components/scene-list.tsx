import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LuFilm, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

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
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

import { useDeleteScene } from '../hooks/mutations/use-delete-scene';
import type { SceneListItem } from '../hooks/queries/use-scene-list';
import { useSceneList } from '../hooks/queries/use-scene-list';
import { SceneForm } from './scene-form';

interface iSceneListProps {
  seriesId: string;
}

function SceneListPending() {
  return (
    <ListPendingState>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, scriptIdx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={scriptIdx} className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((__, sceneIdx) => (
                // eslint-disable-next-line react/no-array-index-key
                <Card key={sceneIdx} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ListPendingState>
  );
}

export function SceneList({ seriesId }: iSceneListProps) {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<SceneListItem | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState<SceneListItem | undefined>(undefined);

  const { data: scriptsData, isPending: isScriptsPending, error: scriptsError } = useScriptList(seriesId);
  const { deleteScene, isPending: isDeleting } = useDeleteScene();

  const scriptIds = scriptsData?.items.map((script) => script._id) ?? [];

  const sceneQueries = scriptIds.map((scriptId) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSceneList(scriptId),
  );

  const isPending = isScriptsPending || sceneQueries.some((q) => q.isPending);
  const error = scriptsError ?? sceneQueries.find((q) => q.error)?.error;

  const handleCardClick = (sceneId: string) => {
    void navigate({
      to: '/series/$seriesId/knowledge-base/scenes/$sceneId',
      params: { seriesId, sceneId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  const handleEditClick = (scene: SceneListItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingScene(scene);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (scene: SceneListItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setSceneToDelete(scene);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sceneToDelete) {
      deleteScene(
        { sceneId: sceneToDelete._id },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setSceneToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingScene(undefined);
    }
  };

  if (isPending) {
    return <SceneListPending />;
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return <ListErrorState message={message} />;
  }

  const scripts = scriptsData?.items ?? [];
  const allScenes = sceneQueries.flatMap((query, index) => {
    const scriptId = scriptIds[index];
    const script = scripts.find((s) => s._id === scriptId);
    return (query.data?.items ?? []).map((scene) => ({
      ...scene,
      scriptTitle: script?.title ?? 'Unknown Script',
    }));
  });

  if (allScenes.length === 0) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <LuFilm className="size-10 text-muted-foreground" />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyContent>
            <EmptyTitle>No scenes yet</EmptyTitle>
            <EmptyDescription>Get started by creating your first scene</EmptyDescription>
          </EmptyContent>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <LuPlus className="size-4" />
            Add Scene
          </Button>
        </Empty>
        <SceneForm seriesId={seriesId} open={isFormOpen} onOpenChange={handleFormOpenChange} />
      </>
    );
  }

  const scenesByScript = scripts.map((script) => ({
    script,
    scenes: allScenes.filter((scene) => scene.scriptId === script._id),
  }));

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Scenes</h2>
          <Button onClick={() => setIsFormOpen(true)} size="sm" className="gap-2">
            <LuPlus className="size-4" />
            Add Scene
          </Button>
        </div>

        {scenesByScript.map(({ script, scenes }) => {
          if (scenes.length === 0) return null;

          return (
            <div key={script._id} className="space-y-4">
              <h3 className="text-base font-medium text-foreground">{script.title}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scenes.map((scene) => (
                  <Card
                    key={scene._id}
                    className="group cursor-pointer overflow-hidden transition-colors hover:border-primary/50"
                    onClick={() => handleCardClick(scene._id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-muted-foreground">#{scene.sceneNumber}</span>
                          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleEditClick(scene, e)}
                              className="h-8 w-8 p-0"
                            >
                              <LuPencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteClick(scene, e)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <LuTrash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <h4 className="line-clamp-2 font-semibold text-foreground">{scene.heading}</h4>
                        {scene.locationId ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {scene.locationId}
                            </Badge>
                          </div>
                        ) : null}
                        {scene.emotionalTone ? (
                          <Badge variant="outline" className="text-xs">
                            {scene.emotionalTone}
                          </Badge>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <SceneForm seriesId={seriesId} open={isFormOpen} onOpenChange={handleFormOpenChange} initialData={editingScene} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete scene &quot;{sceneToDelete?.heading}&quot;. This action cannot be undone.
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
    </>
  );
}

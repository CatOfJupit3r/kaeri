import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LuArrowLeft, LuClock, LuFilm, LuMapPin, LuPencil, LuUsers, LuZap } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card } from '@~/components/ui/card';
import { Skeleton } from '@~/components/ui/skeleton';

import type { SceneDetailQueryReturnType } from '../hooks/queries/use-scene';
import { SceneForm } from './scene-form';

interface iSceneDetailProps {
  scene: SceneDetailQueryReturnType;
  scriptName?: string;
  seriesId: string;
  previousScene?: { _id: string; sceneNumber: number; heading: string };
  nextScene?: { _id: string; sceneNumber: number; heading: string };
  characters?: Array<{ _id: string; name: string }>;
  location?: { _id: string; name: string };
  props?: Array<{ _id: string; name: string }>;
}

export function SceneDetail({
  scene,
  scriptName,
  seriesId,
  previousScene,
  nextScene,
  characters = [],
  location,
  props = [],
}: iSceneDetailProps) {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleBack = () => {
    void navigate({
      to: '/series/$seriesId/knowledge-base',
      params: { seriesId },
      search: { tab: 'scenes' },
    });
  };

  const handleNavigateToScene = (sceneId: string) => {
    void navigate({
      to: '/series/$seriesId/knowledge-base/scenes/$sceneId',
      params: { seriesId, sceneId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0 md:h-9 md:w-9">
                <LuArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 md:h-12 md:w-12">
                <LuFilm className="h-5 w-5 text-indigo-500 md:h-6 md:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">Scene #{scene.sceneNumber}</span>
                  <h1 className="text-lg font-semibold text-foreground md:text-xl">{scene.heading}</h1>
                </div>
                {scriptName ? <p className="text-xs text-muted-foreground md:text-sm">{scriptName}</p> : null}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFormOpen(true)}
              className="w-full gap-1.5 bg-transparent md:w-auto md:gap-2"
            >
              <LuPencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Edit Scene</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
              <Card className="border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <LuMapPin className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                </div>
                <p className="font-medium text-foreground">{location?.name ?? 'Not specified'}</p>
              </Card>

              <Card className="border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <LuClock className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-medium text-muted-foreground">Time & Duration</h3>
                </div>
                <p className="font-medium text-foreground">
                  {scene.timeOfDay ?? 'Not specified'}
                  {scene.duration ? ` • ${scene.duration}` : null}
                </p>
              </Card>

              <Card className="border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <LuZap className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-medium text-muted-foreground">Emotional Tone</h3>
                </div>
                <p className="font-medium text-foreground">{scene.emotionalTone ?? 'Not specified'}</p>
              </Card>
            </div>

            {scene.conflict ? (
              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Conflict</h2>
                <p className="leading-relaxed text-foreground">{scene.conflict}</p>
              </Card>
            ) : null}

            {characters.length > 0 && (
              <Card className="border-border bg-card p-4 md:p-6">
                <div className="mb-3 flex items-center gap-2 md:mb-4">
                  <LuUsers className="h-4 w-4 text-blue-500 md:h-5 md:w-5" />
                  <h2 className="text-base font-semibold text-foreground md:text-lg">Characters Present</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {characters.map((char) => (
                    <Badge key={char._id} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {char.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {scene.beats.length > 0 && (
              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Scene Beats</h2>
                <div className="space-y-3">
                  {scene.beats.map((beat) => (
                    <div key={beat.order} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-medium text-indigo-500">
                        {beat.order + 1}
                      </div>
                      <p className="flex-1 pt-1 text-sm text-foreground">{beat.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Production Details</h2>
                <div className="space-y-3">
                  {props.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Props</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {props.map((prop) => (
                          <Badge key={prop._id} variant="outline" className="text-xs">
                            {prop.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {scene.lighting ? (
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">Lighting</h3>
                      <p className="text-sm text-foreground">{scene.lighting}</p>
                    </div>
                  ) : null}
                  {scene.sound ? (
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">Sound Design</h3>
                      <p className="text-sm text-foreground">{scene.sound}</p>
                    </div>
                  ) : null}
                  {scene.camera ? (
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">Camera</h3>
                      <p className="text-sm text-foreground">{scene.camera}</p>
                    </div>
                  ) : null}
                </div>
              </Card>

              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Scene Flow</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Previous Scene</h3>
                    {previousScene ? (
                      <button
                        type="button"
                        onClick={() => handleNavigateToScene(previousScene._id)}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <span className="font-mono text-xs text-muted-foreground">#{previousScene.sceneNumber}</span>
                        <span className="text-foreground">{previousScene.heading}</span>
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">First scene</p>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Next Scene</h3>
                    {nextScene ? (
                      <button
                        type="button"
                        onClick={() => handleNavigateToScene(nextScene._id)}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <span className="font-mono text-xs text-muted-foreground">#{nextScene.sceneNumber}</span>
                        <span className="text-foreground">{nextScene.heading}</span>
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Last scene</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {scene.storyNotes ? (
              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">
                  Director&apos;s Notes
                </h2>
                <p className="leading-relaxed text-foreground">{scene.storyNotes}</p>
              </Card>
            ) : null}

            {scene.storyboardUrl ? (
              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Storyboard</h2>
                <div className="overflow-hidden rounded-lg border border-border">
                  <img src={scene.storyboardUrl} alt="Scene storyboard" className="w-full" />
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <SceneForm seriesId={seriesId} open={isFormOpen} onOpenChange={setIsFormOpen} initialData={scene} />
    </>
  );
}

export function SceneDetailSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Skeleton className="h-8 w-8 md:h-9 md:w-9" />
            <Skeleton className="h-10 w-10 rounded-full md:h-12 md:w-12" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-64 md:h-6" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-9 w-full md:w-28" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Card key={i} className="border-border bg-card p-4">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </Card>
            ))}
          </div>
          <Card className="border-border bg-card p-4 md:p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { LuFileText, LuImage, LuInfo, LuMapPin, LuPackage, LuUser } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@~/components/ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { CharacterHoverPreview } from '@~/features/knowledge-base/components/character-hover-preview';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

import { useLocation } from '../hooks/queries/use-location';

interface iLocationDetailProps {
  locationId: string;
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationDetail({ locationId, seriesId, open, onOpenChange }: iLocationDetailProps) {
  const [activeTab, setActiveTab] = useState('info');

  const { data: location, isPending, error } = useLocation(locationId, seriesId);
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: propsData } = usePropList(seriesId, 100, 0);

  const getScriptTitle = (scriptId: string) => {
    const script = scriptsData?.items.find((s) => s._id === scriptId);
    return script?.title ?? 'Unknown Script';
  };

  const getCharacterName = (charId: string) => {
    const char = charactersData?.items.find((c) => c._id === charId);
    return char?.name ?? 'Unknown Character';
  };

  const getPropName = (propId: string) => {
    const prop = propsData?.items.find((p) => p._id === propId);
    return prop?.name ?? 'Unknown Prop';
  };

  if (isPending) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Loading location...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !location) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex h-64 items-center justify-center">
            <p className="text-destructive">{error ? `Error: ${error.message}` : 'Location not found'}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Group appearances by script
  const appearancesByScript = (location.appearances ?? []).reduce<
    Record<string, Array<{ scriptId: string; sceneRef: string; locationId?: string }>>
  >((acc, appearance) => {
    if (!acc[appearance.scriptId]) {
      acc[appearance.scriptId] = [];
    }
    acc[appearance.scriptId].push(appearance);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10">
              <LuMapPin className="size-8 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{location.name}</DialogTitle>
              {location.description ? (
                <DialogDescription className="mt-1 text-base">{location.description}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="gap-2">
              <LuInfo className="size-4" />
              <span>Info</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <LuImage className="size-4" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger value="associations" className="gap-2">
              <LuUser className="size-4" />
              <span>Associations</span>
            </TabsTrigger>
            <TabsTrigger value="appearances" className="gap-2">
              <LuMapPin className="size-4" />
              <span>Appearances</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            {location.tags && location.tags.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {location.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {location.mood ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mood</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{location.mood}</p>
                </CardContent>
              </Card>
            ) : null}

            {location.timeOfDay && location.timeOfDay.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Time of Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {location.timeOfDay.map((time) => (
                      <Badge key={time} variant="outline">
                        {time.charAt(0).toUpperCase() + time.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {location.productionNotes ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LuFileText className="size-4" />
                    Production Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{location.productionNotes}</p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="images" className="mt-4 space-y-4">
            {location.images && location.images.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {location.images.map((image, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="aspect-video overflow-hidden rounded-md bg-muted">
                        <img
                          src={image.url}
                          alt={image.caption ?? `Location image ${index + 1}`}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="flex h-full items-center justify-center text-muted-foreground">Image unavailable</div>';
                            }
                          }}
                        />
                      </div>
                      {image.caption ? <p className="mt-2 text-sm text-muted-foreground">{image.caption}</p> : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyMedia>
                  <LuImage className="size-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No images</EmptyTitle>
                  <EmptyDescription>This location has no reference images yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>

          <TabsContent value="associations" className="mt-4 space-y-4">
            {location.associatedCharacterIds && location.associatedCharacterIds.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LuUser className="size-4" />
                    Associated Characters
                  </CardTitle>
                  <CardDescription>{location.associatedCharacterIds.length} character(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {location.associatedCharacterIds.map((charId) => (
                      <div key={charId} className="flex items-center gap-2 rounded-lg border p-3">
                        <CharacterHoverPreview characterId={charId} seriesId={seriesId}>
                          <button type="button" className="font-medium text-primary hover:underline">
                            {getCharacterName(charId)}
                          </button>
                        </CharacterHoverPreview>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {location.propIds && location.propIds.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LuPackage className="size-4" />
                    Props Used
                  </CardTitle>
                  <CardDescription>{location.propIds.length} prop(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {location.propIds.map((propId) => (
                      <Badge key={propId} variant="secondary">
                        {getPropName(propId)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {(!location.associatedCharacterIds || location.associatedCharacterIds.length === 0) &&
            (!location.propIds || location.propIds.length === 0) ? (
              <Empty>
                <EmptyMedia>
                  <LuUser className="size-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No associations</EmptyTitle>
                  <EmptyDescription>This location has no associated characters or props.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}
          </TabsContent>

          <TabsContent value="appearances" className="mt-4 space-y-4">
            {location.appearances && location.appearances.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(appearancesByScript).map(([scriptId, appearances]) => (
                  <Card key={scriptId}>
                    <CardHeader>
                      <CardTitle className="text-lg">{getScriptTitle(scriptId)}</CardTitle>
                      <CardDescription>{appearances?.length ?? 0} scene(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(appearances ?? []).map((appearance) => (
                          <div key={`${appearance.scriptId}-${appearance.sceneRef}`} className="rounded-lg border p-3">
                            <p className="font-medium">Scene: {appearance.sceneRef}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyMedia>
                  <LuMapPin className="size-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No appearances</EmptyTitle>
                  <EmptyDescription>This location has not appeared in any scenes yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

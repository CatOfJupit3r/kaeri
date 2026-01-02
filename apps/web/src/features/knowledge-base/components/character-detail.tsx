import { useState } from 'react';
import { LuInfo, LuPencil, LuTrash2, LuTags } from 'react-icons/lu';

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
import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@~/components/ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { useCharacter } from '@~/features/characters/hooks/queries/use-character';
import { useAddVariation } from '@~/features/knowledge-base/hooks/mutations/use-add-variation';
import { useRemoveVariation } from '@~/features/knowledge-base/hooks/mutations/use-remove-variation';
import { useUpdateVariation } from '@~/features/knowledge-base/hooks/mutations/use-update-variation';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

import { VariationForm } from './variation-form';

interface iVariation {
  scriptId: string;
  label: string;
  notes?: string;
}

interface iCharacterDetailProps {
  characterId: string;
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterDetail({ characterId, seriesId, open, onOpenChange }: iCharacterDetailProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [isVariationFormOpen, setIsVariationFormOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<iVariation | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [variationToDelete, setVariationToDelete] = useState<iVariation | undefined>(undefined);

  const { data: character, isLoading, error } = useCharacter(characterId, seriesId);
  const { data: scriptsData } = useScriptList(seriesId);
  const { addVariation, isPending: isAdding } = useAddVariation();
  const { updateVariation, isPending: isUpdating } = useUpdateVariation();
  const { removeVariation, isPending: isDeleting } = useRemoveVariation();

  const handleVariationSubmit = (variation: iVariation) => {
    if (editingVariation) {
      updateVariation(
        {
          seriesId,
          characterId,
          scriptId: editingVariation.scriptId,
          label: editingVariation.label,
          patch: {
            label: variation.label,
            notes: variation.notes,
          },
        },
        {
          onSuccess: () => {
            setIsVariationFormOpen(false);
            setEditingVariation(undefined);
          },
        },
      );
    } else {
      addVariation(
        {
          seriesId,
          characterId,
          variation,
        },
        {
          onSuccess: () => {
            setIsVariationFormOpen(false);
          },
        },
      );
    }
  };

  const handleEditClick = (variation: iVariation) => {
    setEditingVariation(variation);
    setIsVariationFormOpen(true);
  };

  const handleDeleteClick = (variation: iVariation) => {
    setVariationToDelete(variation);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (variationToDelete) {
      removeVariation(
        {
          seriesId,
          characterId,
          scriptId: variationToDelete.scriptId,
          label: variationToDelete.label,
        },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setVariationToDelete(undefined);
          },
        },
      );
    }
  };

  const handleVariationFormOpenChange = (isOpen: boolean) => {
    setIsVariationFormOpen(isOpen);
    if (!isOpen) {
      setEditingVariation(undefined);
    }
  };

  const getScriptTitle = (scriptId: string) => {
    const script = scriptsData?.items.find((s) => s._id === scriptId);
    return script?.title ?? 'Unknown Script';
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Loading character...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !character) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex h-64 items-center justify-center">
            <p className="text-destructive">{error ? `Error: ${error.message}` : 'Character not found'}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const initials = character.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                {character.avatarUrl ? <AvatarImage src={character.avatarUrl} alt={character.name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{character.name}</DialogTitle>
                {character.description ? (
                  <DialogDescription className="mt-1">{character.description}</DialogDescription>
                ) : null}
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info" className="gap-2">
                <LuInfo className="size-4" />
                <span>Info</span>
              </TabsTrigger>
              <TabsTrigger value="variations" className="gap-2">
                <LuTags className="size-4" />
                <span>Variations</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              {character.traits && character.traits.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Traits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {character.traits.map((trait) => (
                        <Badge key={trait} variant="secondary">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {character.relationships && character.relationships.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Relationships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {character.relationships.map((rel) => (
                        <div
                          key={`${rel.targetId}-${rel.type}`}
                          className="flex items-start gap-2 rounded-lg border p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{rel.type}</p>
                            {rel.note ? <p className="text-sm text-muted-foreground">{rel.note}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {character.appearances && character.appearances.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Appearances</CardTitle>
                    <CardDescription>{character.appearances.length} scene(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {character.appearances.map((appearance) => (
                        <div
                          key={`${appearance.scriptId}-${appearance.sceneRef}`}
                          className="flex items-start gap-2 rounded-lg border p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{getScriptTitle(appearance.scriptId)}</p>
                            <p className="text-sm text-muted-foreground">Scene: {appearance.sceneRef}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="variations" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Script Variations</h3>
                  <p className="text-sm text-muted-foreground">{character.variations?.length ?? 0} variation(s)</p>
                </div>
                <Button onClick={() => setIsVariationFormOpen(true)} size="sm">
                  Add Variation
                </Button>
              </div>

              {character.variations && character.variations.length > 0 ? (
                <div className="space-y-3">
                  {character.variations.map((variation) => (
                    <Card key={`${variation.scriptId}-${variation.label}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge>{getScriptTitle(variation.scriptId)}</Badge>
                              <span className="font-semibold">{variation.label}</span>
                            </div>
                            {variation.notes ? (
                              <p className="text-sm text-muted-foreground">{variation.notes}</p>
                            ) : null}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditClick(variation)}
                              className="size-8 p-0"
                            >
                              <LuPencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(variation)}
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
              ) : (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <LuTags />
                    </EmptyMedia>
                    <EmptyTitle>No variations yet</EmptyTitle>
                    <EmptyDescription>
                      Add script-specific variations to track character differences across timelines or alternate
                      scripts.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={() => setIsVariationFormOpen(true)} size="sm">
                      Add First Variation
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <VariationForm
        seriesId={seriesId}
        open={isVariationFormOpen}
        onOpenChange={handleVariationFormOpenChange}
        onSubmit={handleVariationSubmit}
        initialData={editingVariation}
        isPending={isAdding || isUpdating}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the variation &quot;{variationToDelete?.label}&quot; for script &quot;
              {variationToDelete ? getScriptTitle(variationToDelete.scriptId) : ''}&quot;? This action cannot be undone.
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

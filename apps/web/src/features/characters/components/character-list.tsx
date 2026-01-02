import { useState } from 'react';
import { LuPencil, LuTrash2, LuUsers } from 'react-icons/lu';

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
import { Button } from '@~/components/ui/button';
import { Card, CardContent } from '@~/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@~/components/ui/empty';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';

import { useDeleteCharacter } from '../hooks/mutations/use-delete-character';
import { CharacterForm } from './character-form';

interface iCharacter {
  _id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  traits?: string[];
  relationships?: Array<{
    targetId: string;
    type: string;
    note?: string;
  }>;
  appearances?: Array<{
    scriptId: string;
    sceneRef: string;
    locationId?: string;
  }>;
}

interface iCharacterListProps {
  seriesId: string;
}

export function CharacterList({ seriesId }: iCharacterListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<iCharacter | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<iCharacter | undefined>(undefined);
  const { data, isLoading, error } = useCharacterList(seriesId);
  const { deleteCharacter, isPending: isDeleting } = useDeleteCharacter();

  const handleEditClick = (character: iCharacter) => {
    setEditingCharacter(character);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (character: iCharacter) => {
    setCharacterToDelete(character);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (characterToDelete) {
      deleteCharacter(
        { id: characterToDelete._id, seriesId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setCharacterToDelete(undefined);
          },
        },
      );
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCharacter(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading characters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Error loading characters: {error.message}</p>
      </div>
    );
  }

  const characters = data?.items ?? [];

  if (characters.length === 0) {
    return (
      <>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LuUsers />
            </EmptyMedia>
            <EmptyTitle>No characters yet</EmptyTitle>
            <EmptyDescription>Create your first character to start building your story&apos;s cast.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsFormOpen(true)}>New Character</Button>
          </EmptyContent>
        </Empty>
        <CharacterForm
          seriesId={seriesId}
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          initialData={editingCharacter}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} {data?.total === 1 ? 'character' : 'characters'}
          </p>
          <Button onClick={() => setIsFormOpen(true)}>New Character</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => {
            const traitCount = character.traits?.length ?? 0;
            const relationshipCount = character.relationships?.length ?? 0;
            const appearanceCount = character.appearances?.length ?? 0;
            const initials = character.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={character._id} className="group overflow-hidden transition-all hover:shadow-md">
                <CardContent className="flex gap-4 p-4">
                  <Avatar className="size-12">
                    {character.avatarUrl ? <AvatarImage src={character.avatarUrl} alt={character.name} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
                      {character.name}
                    </h3>
                    {character.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{character.description}</p>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          {traitCount} {traitCount === 1 ? 'trait' : 'traits'}
                        </span>
                        <span>
                          {relationshipCount} {relationshipCount === 1 ? 'relationship' : 'relationships'}
                        </span>
                        <span>
                          {appearanceCount} {appearanceCount === 1 ? 'appearance' : 'appearances'}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(character);
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
                            handleDeleteClick(character);
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
      <CharacterForm
        seriesId={seriesId}
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        initialData={editingCharacter}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{characterToDelete?.name}&quot;? This action cannot be undone.
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

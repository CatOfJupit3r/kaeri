import { useEffect } from 'react';
import { LuArrowLeft, LuX } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Separator } from '@~/components/ui/separator';
import { RelationshipPicker } from '@~/features/knowledge-base/components/relationship-picker';
import { useAutoSave } from '@~/hooks/use-auto-save';

import { useUpdateCharacter } from '../hooks/mutations/use-update-character';
import { useCharacter } from '../hooks/queries/use-character';
import { useCharacterList } from '../hooks/queries/use-character-list';
import type { CharacterListItem } from '../hooks/queries/use-character-list';
import { characterFormSchema } from '../schemas/character.schema';
import { AppearancePicker } from './appearance-picker';

type Relationship = NonNullable<CharacterListItem['relationships']>[number];
type Appearance = NonNullable<CharacterListItem['appearances']>[number];

interface iCharacterEditPanelProps {
  characterId: string;
  seriesId: string;
  onClose: () => void;
}

export function CharacterEditPanel({ characterId, seriesId, onClose }: iCharacterEditPanelProps) {
  const { data: character, isPending: isLoading, error } = useCharacter(characterId, seriesId);
  const { updateCharacter, isPending: isUpdating } = useUpdateCharacter();
  const { data: characterListData } = useCharacterList(seriesId);

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      avatarUrl: '',
      traits: [] as string[],
      relationships: [] as Relationship[],
      appearances: [] as Appearance[],
    },
    onSubmit: async ({ value }) => {
      if (!character) return;

      updateCharacter({
        id: character._id,
        seriesId,
        patch: {
          name: value.name || undefined,
          description: value.description || undefined,
          avatarUrl: value.avatarUrl || undefined,
          traits: value.traits.length > 0 ? value.traits : undefined,
          relationships: value.relationships.length > 0 ? value.relationships : undefined,
          appearances: value.appearances.length > 0 ? value.appearances : undefined,
        },
      });
    },
    validators: {
      onSubmit: characterFormSchema,
    },
  });

  const { handleAutoSave, resetInitialization } = useAutoSave(form, { isUpdating });

  // Sync form with character data when loaded
  useEffect(() => {
    if (character) {
      resetInitialization();
      form.reset({
        name: character.name,
        description: character.description ?? '',
        avatarUrl: character.avatarUrl ?? '',
        traits: character.traits ?? [],
        relationships: character.relationships ?? [],
        appearances: character.appearances ?? [],
      });
    }
  }, [character, form, resetInitialization]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading character...</p>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Character not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-foreground bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <LuArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-lg font-bold">Edit Character</h2>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <form.AppForm>
          <form.Form className="p-4">
            {/* Basic Info Section - 3 columns */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Core details about this character</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Name */}
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label="Name"
                        placeholder="Enter character name"
                        required
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  {/* Avatar URL */}
                  <form.AppField name="avatarUrl">
                    {(field) => (
                      <field.TextField
                        label="Avatar URL"
                        placeholder="https://example.com/avatar.jpg"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  {/* Traits */}
                  <form.Field name="traits" mode="array">
                    {(field) => {
                      const traits = field.state.value || [];
                      return (
                        <div className="space-y-2">
                          <Label htmlFor="traits">Traits</Label>
                          <div className="flex gap-2">
                            <Input
                              id="traits"
                              placeholder="Add trait (Enter)"
                              disabled={isUpdating}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const trimmedTrait = input.value.trim();
                                  if (trimmedTrait && !traits.includes(trimmedTrait)) {
                                    field.pushValue(trimmedTrait);
                                    input.value = '';
                                    handleAutoSave();
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.getElementById('traits') as HTMLInputElement;
                                if (input) {
                                  const trimmedTrait = input.value.trim();
                                  if (trimmedTrait && !traits.includes(trimmedTrait)) {
                                    field.pushValue(trimmedTrait);
                                    input.value = '';
                                    handleAutoSave();
                                  }
                                }
                              }}
                              disabled={isUpdating}
                            >
                              Add
                            </Button>
                          </div>
                          {traits.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {traits.map((trait, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <Badge key={`${trait}-${index}`} variant="secondary" className="gap-1">
                                  {trait}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.removeValue(index);
                                      handleAutoSave();
                                    }}
                                    className="ml-1 rounded-full hover:bg-muted"
                                    disabled={isUpdating}
                                  >
                                    <LuX className="size-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    }}
                  </form.Field>
                </div>

                {/* Description - full width */}
                <div className="mt-4">
                  <form.AppField name="description">
                    {(field) => (
                      <field.TextareaField
                        label="Description"
                        placeholder="Describe the character's background, personality, and role in the story..."
                        rows={4}
                        maxLength={500}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Two-column layout for Relationships and Appearances */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Relationships Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Relationships</CardTitle>
                  <CardDescription>Connections to other characters</CardDescription>
                </CardHeader>
                <CardContent>
                  <form.Field name="relationships" mode="array">
                    {(field) => {
                      const relationships = field.state.value ?? [];
                      return (
                        <RelationshipPicker
                          characters={characterListData?.items ?? []}
                          currentCharacterId={character._id}
                          relationships={relationships}
                          onAdd={(relationship) => {
                            const existingIndex = relationships.findIndex(
                              (rel) => rel.targetId === relationship.targetId,
                            );
                            if (existingIndex === -1) {
                              field.pushValue(relationship);
                            } else {
                              field.replaceValue(existingIndex, relationship);
                            }
                            handleAutoSave();
                          }}
                          onRemove={(targetId) => {
                            const index = relationships.findIndex((rel) => rel.targetId === targetId);
                            if (index !== -1) {
                              field.removeValue(index);
                              handleAutoSave();
                            }
                          }}
                          disabled={isUpdating}
                        />
                      );
                    }}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Appearances Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Appearances</CardTitle>
                  <CardDescription>Where this character appears in scripts</CardDescription>
                </CardHeader>
                <CardContent>
                  <form.Field name="appearances" mode="array">
                    {(field) => {
                      const appearances = field.state.value ?? [];
                      return (
                        <AppearancePicker
                          seriesId={seriesId}
                          appearances={appearances}
                          onAdd={(appearance) => {
                            field.pushValue(appearance);
                            handleAutoSave();
                          }}
                          onRemove={(index) => {
                            field.removeValue(index);
                            handleAutoSave();
                          }}
                          disabled={isUpdating}
                        />
                      );
                    }}
                  </form.Field>
                </CardContent>
              </Card>
            </div>
          </form.Form>
        </form.AppForm>
      </ScrollArea>
    </div>
  );
}

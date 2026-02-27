import { useEffect } from 'react';
import { LuX } from 'react-icons/lu';

import { EditPanelWrapper } from '@~/components/forms';
import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { RelationshipPicker } from '@~/features/knowledge-base/components/relationship-picker';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateCharacter } from '../hooks/mutations/use-update-character';
import type { CharacterDetailQueryReturnType } from '../hooks/queries/use-character-detail';
import type { CharacterListItem } from '../hooks/queries/use-character-list';
import { useCharacterList } from '../hooks/queries/use-character-list';
import { characterFormSchema } from '../schemas/character.schema';
import { AppearancePicker } from './appearance-picker';
import { CharacterFormFields } from './character-form-fields';

type Relationship = NonNullable<CharacterListItem['relationships']>[number];
type Appearance = NonNullable<CharacterListItem['appearances']>[number];

interface iCharacterEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: CharacterDetailQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CharacterEditForm({
  mode,
  seriesId,
  initialData,
  onClose,
  open,
  onOpenChange,
}: iCharacterEditFormProps) {
  const { updateCharacter, isPending: isUpdating } = useUpdateCharacter();
  const { data: characterListData } = useCharacterList(seriesId);

  const isPanelMode = mode === EDIT_FORM_MODES.panel;

  const form = useAppForm({
    defaultValues: {
      name: initialData.name,
      description: initialData.description ?? '',
      avatarUrl: initialData.avatarUrl ?? '',
      traits: initialData.traits ?? ([] as string[]),
      relationships: (initialData.relationships ?? []) as Relationship[],
      appearances: (initialData.appearances ?? []) as Appearance[],
    },
    onSubmit: async ({ value }) => {
      updateCharacter(
        {
          id: initialData._id,
          seriesId,
          patch: {
            name: value.name || undefined,
            description: value.description || undefined,
            avatarUrl: value.avatarUrl || undefined,
            traits: value.traits.length > 0 ? value.traits : undefined,
            relationships: value.relationships.length > 0 ? value.relationships : undefined,
            appearances: value.appearances.length > 0 ? value.appearances : undefined,
          },
        },
        {
          onSuccess: () => {
            if (!isPanelMode) {
              onOpenChange?.(false);
            }
          },
        },
      );
    },
    validators: {
      onSubmit: characterFormSchema,
    },
  });

  const { handleAutoSave, resetInitialization } = useAutoSave(form, {
    isUpdating,
    enabled: isPanelMode,
  });

  // Reset initialization when switching characters
  useEffect(() => {
    resetInitialization();
  }, [initialData._id, resetInitialization]);

  // --- PANEL MODE ---
  if (isPanelMode) {
    return (
      <EditPanelWrapper title="Edit Character" onClose={onClose}>
        <form.AppForm>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Core details about this character</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              {/* Relationships */}
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
                          currentCharacterId={initialData._id}
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

              {/* Appearances */}
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
      </EditPanelWrapper>
    );
  }

  // --- DIALOG MODE ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Character</DialogTitle>
          <DialogDescription>Update the character details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <CharacterFormFields form={form} isPending={isUpdating} />

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
                        placeholder="Add a trait (press Enter)"
                        disabled={isUpdating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const trimmedTrait = input.value.trim();
                            if (trimmedTrait && !traits.includes(trimmedTrait)) {
                              field.pushValue(trimmedTrait);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('traits') as HTMLInputElement;
                          if (input) {
                            const trimmedTrait = input.value.trim();
                            if (trimmedTrait && !traits.includes(trimmedTrait)) {
                              field.pushValue(trimmedTrait);
                              input.value = '';
                            }
                          }
                        }}
                        disabled={isUpdating}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {traits.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {traits.map((trait, index) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <Badge key={`${trait}-${index}`} variant="secondary" className="gap-1">
                            {trait}
                            <button
                              type="button"
                              onClick={() => field.removeValue(index)}
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

            {/* Relationships */}
            <form.Field name="relationships" mode="array">
              {(field) => {
                const relationships = field.state.value ?? [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="character-relationships">Relationships</Label>
                    <div id="character-relationships">
                      <RelationshipPicker
                        characters={characterListData?.items ?? []}
                        currentCharacterId={initialData._id}
                        relationships={relationships}
                        onAdd={(relationship) => {
                          const existingIndex = relationships.findIndex(
                            (rel) => rel.targetId === relationship.targetId,
                          );
                          if (existingIndex !== -1) {
                            field.replaceValue(existingIndex, relationship);
                          } else {
                            field.pushValue(relationship);
                          }
                        }}
                        onRemove={(targetId) => {
                          const index = relationships.findIndex((rel) => rel.targetId === targetId);
                          if (index !== -1) {
                            field.removeValue(index);
                          }
                        }}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                );
              }}
            </form.Field>

            {/* Appearances */}
            <form.Field name="appearances" mode="array">
              {(field) => {
                const appearances = field.state.value ?? [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="character-appearances">Appearances</Label>
                    <div id="character-appearances">
                      <AppearancePicker
                        seriesId={seriesId}
                        appearances={appearances}
                        onAdd={(appearance) => field.pushValue(appearance)}
                        onRemove={(index) => field.removeValue(index)}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                );
              }}
            </form.Field>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange?.(false)}
                submitLabel="Update Character"
                loadingLabel="Updating..."
                isDisabled={isUpdating}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

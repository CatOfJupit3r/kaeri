import { useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import z from 'zod';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
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

import { useCreateCharacter } from '../hooks/mutations/use-create-character';
import { useUpdateCharacter } from '../hooks/mutations/use-update-character';
import { useCharacterList } from '../hooks/queries/use-character-list';
import type { CharacterListItem } from '../hooks/queries/use-character-list';
import { AppearancePicker } from './appearance-picker';

type Relationship = NonNullable<CharacterListItem['relationships']>[number];
type Appearance = NonNullable<CharacterListItem['appearances']>[number];
type Character = CharacterListItem;

interface iCharacterFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Character;
}

export function CharacterForm({ seriesId, open, onOpenChange, initialData }: iCharacterFormProps) {
  const { createCharacter, isPending: isCreating } = useCreateCharacter();
  const { updateCharacter, isPending: isUpdating } = useUpdateCharacter();
  const { data: characterListData } = useCharacterList(seriesId);

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      avatarUrl: initialData?.avatarUrl ?? '',
      traits: initialData?.traits ?? ([] as string[]),
      relationships: initialData?.relationships ?? ([] as Relationship[]),
      appearances: initialData?.appearances ?? ([] as Appearance[]),
    },
    onSubmit: async ({ value }) => {
      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();
      const normalizedAvatarUrl = value.avatarUrl.trim();

      if (isEditMode && initialData) {
        updateCharacter(
          {
            id: initialData._id,
            seriesId,
            patch: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              avatarUrl: normalizedAvatarUrl || undefined,
              traits: value.traits.length > 0 ? value.traits : undefined,
              relationships: value.relationships.length > 0 ? value.relationships : undefined,
              appearances: value.appearances.length > 0 ? value.appearances : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createCharacter(
          {
            seriesId,
            value: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              avatarUrl: normalizedAvatarUrl || undefined,
              traits: value.traits.length > 0 ? value.traits : undefined,
              relationships: value.relationships.length > 0 ? value.relationships : undefined,
              appearances: value.appearances.length > 0 ? value.appearances : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
            },
          },
        );
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(500, 'Description must be 500 characters or less'),
        avatarUrl: z
          .string()
          .trim()
          .refine((val) => !val || z.string().url().safeParse(val).success, {
            message: 'Must be a valid URL',
          }),
        traits: z.array(z.string()),
        relationships: z.array(
          z.object({
            targetId: z.string(),
            type: z.string(),
            note: z.string().optional(),
          }),
        ),
        appearances: z.array(
          z.object({
            scriptId: z.string(),
            sceneRef: z.string(),
            locationId: z.string().optional(),
          }),
        ),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        avatarUrl: initialData.avatarUrl ?? '',
        traits: initialData.traits ?? [],
        relationships: initialData.relationships ?? [],
        appearances: initialData.appearances ?? [],
      });
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
        avatarUrl: '',
        traits: [],
        relationships: [],
        appearances: [],
      });
    }
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Character' : 'Create Character'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the character details below.'
              : 'Add a new character to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="name">
                {(field) => <field.TextField label="Name" placeholder="Enter character name" required />}
              </form.AppField>

              <form.AppField name="avatarUrl">
                {(field) => <field.TextField label="Avatar URL" placeholder="https://example.com/avatar.jpg" />}
              </form.AppField>
            </div>

            <form.AppField name="description">
              {(field) => (
                <field.TextareaField
                  label="Description"
                  placeholder="Describe the character..."
                  rows={3}
                  maxLength={500}
                />
              )}
            </form.AppField>

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
                        disabled={isPending}
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
                        disabled={isPending}
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
                              disabled={isPending}
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

            <form.Field name="relationships" mode="array">
              {(field) => {
                const relationships = field.state.value ?? [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="character-relationships">Relationships</Label>
                    <div id="character-relationships">
                      <RelationshipPicker
                        characters={characterListData?.items ?? []}
                        currentCharacterId={initialData?._id}
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
                        disabled={isPending}
                      />
                    </div>
                  </div>
                );
              }}
            </form.Field>

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
                        disabled={isPending}
                      />
                    </div>
                  </div>
                );
              }}
            </form.Field>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel={isEditMode ? 'Update Character' : 'Create Character'}
                loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
                isDisabled={isPending}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

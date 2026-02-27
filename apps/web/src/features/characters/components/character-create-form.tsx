import { LuX } from 'react-icons/lu';

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
import type { CharacterListItem } from '../hooks/queries/use-character-list';
import { characterFormSchema } from '../schemas/character.schema';
import { AppearancePicker } from './appearance-picker';
import { CharacterFormFields } from './character-form-fields';

type Relationship = NonNullable<CharacterListItem['relationships']>[number];
type Appearance = NonNullable<CharacterListItem['appearances']>[number];

interface iCharacterCreateFormProps {
  seriesId: string;
  characters: Array<{ _id: string; name: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterCreateForm({ seriesId, characters, open, onOpenChange }: iCharacterCreateFormProps) {
  const { createCharacter, isPending } = useCreateCharacter();

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
      createCharacter(
        {
          seriesId,
          value: {
            name: value.name,
            description: value.description || undefined,
            avatarUrl: value.avatarUrl || undefined,
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
    },
    validators: {
      onSubmit: characterFormSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Character</DialogTitle>
          <DialogDescription>Add a new character to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <CharacterFormFields form={form} isPending={isPending} />

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

            {/* Relationships */}
            <form.Field name="relationships" mode="array">
              {(field) => {
                const relationships = field.state.value ?? [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="character-relationships">Relationships</Label>
                    <div id="character-relationships">
                      <RelationshipPicker
                        characters={characters}
                        currentCharacterId={undefined}
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
                submitLabel="Create Character"
                loadingLabel="Creating..."
                isDisabled={isPending}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

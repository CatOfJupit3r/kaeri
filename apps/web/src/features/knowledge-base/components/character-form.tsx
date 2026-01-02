import { useState } from 'react';
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

import { useCreateCharacter } from '../hooks/mutations/use-create-character';

interface iCharacterFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterForm({ seriesId, open, onOpenChange }: iCharacterFormProps) {
  const [traits, setTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState('');
  const { createCharacter, isPending } = useCreateCharacter();

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      avatarUrl: '',
    },
    onSubmit: async ({ value }) => {
      createCharacter(
        {
          seriesId,
          value: {
            name: value.name,
            description: value.description || undefined,
            avatarUrl: value.avatarUrl || undefined,
            traits: traits.length > 0 ? traits : undefined,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
            setTraits([]);
            setTraitInput('');
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().max(500, 'Description must be 500 characters or less'),
        avatarUrl: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
          message: 'Must be a valid URL',
        }),
      }),
    },
  });

  const addTrait = () => {
    const trimmedTrait = traitInput.trim();
    if (trimmedTrait && !traits.includes(trimmedTrait)) {
      setTraits([...traits, trimmedTrait]);
      setTraitInput('');
    }
  };

  const removeTrait = (traitToRemove: string) => {
    setTraits(traits.filter((trait) => trait !== traitToRemove));
  };

  const handleTraitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrait();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Character</DialogTitle>
          <DialogDescription>Add a new character to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" placeholder="Enter character name" required />}
            </form.AppField>

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

            <form.AppField name="avatarUrl">
              {(field) => <field.TextField label="Avatar URL" placeholder="https://example.com/avatar.jpg" />}
            </form.AppField>

            <div className="space-y-2">
              <Label htmlFor="traits">Traits</Label>
              <div className="flex gap-2">
                <Input
                  id="traits"
                  value={traitInput}
                  onChange={(e) => setTraitInput(e.target.value)}
                  onKeyDown={handleTraitKeyDown}
                  placeholder="Add a trait (press Enter)"
                  disabled={isPending}
                />
                <Button type="button" onClick={addTrait} disabled={!traitInput.trim() || isPending} size="sm">
                  Add
                </Button>
              </div>
              {traits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="gap-1">
                      {trait}
                      <button
                        type="button"
                        onClick={() => removeTrait(trait)}
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
          </form.Form>
        </form.AppForm>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <form.SubmitButton isDisabled={isPending}>{isPending ? 'Creating...' : 'Create Character'}</form.SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

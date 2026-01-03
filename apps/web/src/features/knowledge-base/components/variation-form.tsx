import { useEffect, useState } from 'react';
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
import { SingleSelect } from '@~/components/ui/select';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

interface iVariation {
  scriptId: string;
  label: string;
  notes?: string;
}

interface iVariationFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (variation: iVariation) => void;
  initialData?: iVariation;
  isPending?: boolean;
}

export function VariationForm({
  seriesId,
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending = false,
}: iVariationFormProps) {
  const [traits, setTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState('');
  const { data: scriptsData } = useScriptList(seriesId);

  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      scriptId: initialData?.scriptId ?? '',
      label: initialData?.label ?? '',
      notes: initialData?.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        scriptId: value.scriptId,
        label: value.label,
        notes: value.notes || undefined,
      });
    },
    validators: {
      onSubmit: z.object({
        scriptId: z.string().min(1, 'Script is required'),
        label: z.string().min(1, 'Label is required').max(100, 'Label must be 100 characters or less'),
        notes: z.string().max(500, 'Notes must be 500 characters or less'),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        scriptId: initialData.scriptId,
        label: initialData.label,
        notes: initialData.notes ?? '',
      });
      setTraits([]);
      setTraitInput('');
    } else if (!open) {
      form.reset({
        scriptId: '',
        label: '',
        notes: '',
      });
      setTraits([]);
      setTraitInput('');
    }
  }, [open, initialData, form]);

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

  const scriptOptions =
    scriptsData?.items.map((script) => ({
      label: script.title,
      value: script._id,
    })) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Variation' : 'Add Variation'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the variation details below.' : 'Add a script-specific variation for this character.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <form.AppField name="scriptId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Script</Label>
                  <SingleSelect
                    value={field.state.value}
                    onValueChange={(value: string | null) => field.handleChange(value ?? '')}
                    options={scriptOptions}
                    placeholder="Select a script"
                    isDisabled={isPending || isEditMode}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
                  ) : null}
                </div>
              )}
            </form.AppField>

            <form.AppField name="label">
              {(field) => <field.TextField label="Label" placeholder="e.g., Timeline A, Alternate Ending" required />}
            </form.AppField>

            <form.AppField name="notes">
              {(field) => (
                <field.TextareaField label="Notes" placeholder="Describe this variation..." rows={3} maxLength={500} />
              )}
            </form.AppField>

            <div className="space-y-2">
              <Label htmlFor="traits">Traits (Optional)</Label>
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

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel={isEditMode ? 'Update Variation' : 'Add Variation'}
                loadingLabel={isEditMode ? 'Updating...' : 'Adding...'}
                isDisabled={isPending}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

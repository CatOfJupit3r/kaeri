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
  const { data: scriptsData } = useScriptList(seriesId);

  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      scriptId: initialData?.scriptId ?? '',
      label: initialData?.label ?? '',
      notes: initialData?.notes ?? '',
      traits: [] as string[],
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
        traits: z.array(z.string()),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        scriptId: initialData.scriptId,
        label: initialData.label,
        notes: initialData.notes ?? '',
        traits: [],
      });
    } else if (!open) {
      form.reset({
        scriptId: '',
        label: '',
        notes: '',
        traits: [],
      });
    }
  }, [open, initialData, form]);

  const scriptOptions =
    scriptsData?.items.map((script) => ({
      label: script.title,
      value: script._id,
    })) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Variation' : 'Add Variation'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the variation details below.' : 'Add a script-specific variation for this character.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <form.AppField name="notes">
              {(field) => (
                <field.TextareaField label="Notes" placeholder="Describe this variation..." rows={3} maxLength={500} />
              )}
            </form.AppField>

            <form.Field name="traits" mode="array">
              {(field) => {
                const traits = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="traits">Traits (Optional)</Label>
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

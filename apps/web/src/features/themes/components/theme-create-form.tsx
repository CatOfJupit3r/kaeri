import { useEffect } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';

import { useCreateTheme } from '../hooks/mutations/use-create-theme';
import { themeFormSchema } from '../schemas/theme.schema';
import type { iCharacterConnection, iThemeEvolution } from './theme-form-fields';
import { ThemeFormFields } from './theme-form-fields';

interface iThemeCreateFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create form for themes.
 * Renders in a dialog with manual submit.
 * Includes basic fields and visual motifs array.
 */
export function ThemeCreateForm({ seriesId, open, onOpenChange }: iThemeCreateFormProps) {
  const { createTheme, isPending } = useCreateTheme();

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      color: '',
      visualMotifs: [] as string[],
      relatedCharacters: [] as iCharacterConnection[],
      evolution: [] as iThemeEvolution[],
    },
    onSubmit: async ({ value }) => {
      createTheme(
        {
          seriesId,
          value: {
            name: value.name,
            description: value.description || undefined,
            color: value.color || undefined,
            visualMotifs: value.visualMotifs.length > 0 ? value.visualMotifs : undefined,
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
      onSubmit: themeFormSchema,
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Theme</DialogTitle>
          <DialogDescription>Add a new theme to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <ThemeFormFields form={form} />

            {/* Visual Motifs */}
            <form.AppField name="visualMotifs" mode="array">
              {(field) => (
                <field.TagArrayField
                  label="Visual Motifs"
                  placeholder="Add a visual motif (press Enter)"
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Theme"
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

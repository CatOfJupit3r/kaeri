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

import { useCreateProp } from '../hooks/mutations/use-create-prop';
import { propFormSchema } from '../schemas/prop.schema';
import type { EntityValue } from './prop-form-fields';
import { entityValuesToAssociations, PropFormFields } from './prop-form-fields';

interface iCharacter {
  _id: string;
  name: string;
}

interface iLocation {
  _id: string;
  name: string;
}

interface iScript {
  _id: string;
  title: string;
}

interface iPropCreateFormProps {
  seriesId: string;
  characters: iCharacter[];
  locations: iLocation[];
  scripts: iScript[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create form for props.
 * Renders in a dialog with manual submit.
 */
export function PropCreateForm({ seriesId, characters, locations, scripts, open, onOpenChange }: iPropCreateFormProps) {
  const { createProp, isPending } = useCreateProp();

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      entityValues: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const associations = entityValuesToAssociations((value.entityValues ?? []) as EntityValue[]);
      createProp(
        {
          seriesId,
          value: {
            name: value.name,
            description: value.description || undefined,
            associations: associations.length > 0 ? associations : undefined,
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
      onSubmit: propFormSchema,
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
          <DialogTitle>Create Prop</DialogTitle>
          <DialogDescription>Add a new prop to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <PropFormFields
              form={form}
              characters={characters}
              locations={locations}
              scripts={scripts}
              isPending={isPending}
            />

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Prop"
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

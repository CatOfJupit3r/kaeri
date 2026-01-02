import { useEffect } from 'react';
import z from 'zod';

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

import { useCreateProp } from '../hooks/mutations/use-create-prop';
import { useUpdateProp } from '../hooks/mutations/use-update-prop';

interface iProp {
  _id: string;
  name: string;
  description?: string;
  associations?: Array<{
    characterId?: string;
    locationId?: string;
    scriptId?: string;
    note?: string;
  }>;
}

interface iPropFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iProp;
}

export function PropForm({ seriesId, open, onOpenChange, initialData }: iPropFormProps) {
  const { createProp, isPending: isCreating } = useCreateProp();
  const { updateProp, isPending: isUpdating } = useUpdateProp();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      associationsJson: initialData?.associations ? JSON.stringify(initialData.associations, null, 2) : '',
    },
    onSubmit: async ({ value }) => {
      let associations: iProp['associations'] | undefined;
      if (value.associationsJson.trim()) {
        try {
          associations = JSON.parse(value.associationsJson);
        } catch {
          return;
        }
      }

      if (isEditMode && initialData) {
        updateProp(
          {
            id: initialData._id,
            seriesId,
            patch: {
              name: value.name,
              description: value.description || undefined,
              associations,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createProp(
          {
            seriesId,
            value: {
              name: value.name,
              description: value.description || undefined,
              associations,
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
        name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().max(500, 'Description must be 500 characters or less'),
        associationsJson: z.string().refine(
          (val) => {
            if (!val.trim()) return true;
            try {
              JSON.parse(val);
              return true;
            } catch {
              return false;
            }
          },
          {
            message: 'Must be valid JSON',
          },
        ),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        associationsJson: initialData.associations ? JSON.stringify(initialData.associations, null, 2) : '',
      });
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
        associationsJson: '',
      });
    }
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Prop' : 'Create Prop'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the prop details below.'
              : 'Add a new prop to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" placeholder="Enter prop name" required />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.TextareaField label="Description" placeholder="Describe the prop..." rows={3} maxLength={500} />
              )}
            </form.AppField>

            <form.AppField name="associationsJson">
              {(field) => (
                <field.TextareaField
                  label="Associations (JSON)"
                  placeholder='[{"characterId": "...", "note": "..."}]'
                  rows={4}
                />
              )}
            </form.AppField>
          </form.Form>
        </form.AppForm>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <form.SubmitButton isDisabled={isPending}>
            {(() => {
              if (isPending) {
                return isEditMode ? 'Updating...' : 'Creating...';
              }
              return isEditMode ? 'Update Prop' : 'Create Prop';
            })()}
          </form.SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

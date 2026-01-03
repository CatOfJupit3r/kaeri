import { useEffect } from 'react';
import z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm, withForm } from '@~/components/ui/field';

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

const propAssociationsSchema = z.array(
  z.object({
    characterId: z.string().optional(),
    locationId: z.string().optional(),
    scriptId: z.string().optional(),
    note: z.string().optional(),
  }),
);

const isValidAssociationsJson = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    return propAssociationsSchema.safeParse(JSON.parse(trimmed)).success;
  } catch {
    return false;
  }
};

const parseAssociationsJson = (value: string): iProp['associations'] | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = propAssociationsSchema.safeParse(JSON.parse(trimmed));
    if (parsed.success) return parsed.data;
  } catch {
    // Validation handles messaging; fallback to undefined here.
  }
  return undefined;
};

const PropFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    associationsJson: '',
  },
  props: {
    isPending: false,
    onCancel: () => {},
    isEditMode: false,
  },
  render: function Render({ form, isPending, onCancel, isEditMode }) {
    return (
      <>
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
              description="Optional JSON array of associations with characterId, locationId, scriptId, and note fields."
            />
          )}
        </form.AppField>

        <DialogFooter>
          <form.FormActions
            onCancel={onCancel}
            submitLabel={isEditMode ? 'Update Prop' : 'Create Prop'}
            loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
            isDisabled={isPending}
          />
        </DialogFooter>
      </>
    );
  },
});

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
      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();
      const associations = parseAssociationsJson(value.associationsJson);

      if (isEditMode && initialData) {
        updateProp(
          {
            id: initialData._id,
            seriesId,
            patch: {
              name: normalizedName,
              description: normalizedDescription || undefined,
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
              name: normalizedName,
              description: normalizedDescription || undefined,
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
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(500, 'Description must be 500 characters or less'),
        associationsJson: z.string().refine(isValidAssociationsJson, {
          message: 'Must be valid JSON array of associations',
        }),
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
            <PropFormFields
              form={form}
              isPending={isPending}
              onCancel={() => onOpenChange(false)}
              isEditMode={isEditMode}
            />
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm, withForm } from '@~/components/ui/field';

import { useCreateWildcard } from '../hooks/mutations/use-create-wildcard';
import { useUpdateWildcard } from '../hooks/mutations/use-update-wildcard';
import { wildcardFormSchema } from '../schemas/wildcard.schema';

interface iWildcard {
  _id: string;
  title: string;
  body?: string;
  tag?: string;
}

interface iWildcardFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iWildcard;
}

const WildcardFormFields = withForm({
  defaultValues: {
    title: '',
    body: '',
    tag: '',
  },
  props: {
    isPending: false,
    onCancel: () => {},
    isEditMode: false,
  },
  render: function Render({ form, isPending, onCancel, isEditMode }) {
    return (
      <>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <form.AppField name="title">
              {(field) => <field.TextField label="Title" placeholder="Enter Wild Card title" required />}
            </form.AppField>
          </div>

          <form.AppField name="tag">
            {(field) => <field.TextField label="Tag" placeholder="Optional tag" maxLength={50} />}
          </form.AppField>
        </div>

        <form.AppField name="body">
          {(field) => (
            <field.TextareaField
              label="Content"
              placeholder="Enter the Wild Card content..."
              rows={5}
              maxLength={1000}
            />
          )}
        </form.AppField>

        <DialogFooter>
          <form.FormActions
            onCancel={onCancel}
            submitLabel={isEditMode ? 'Update Wild Card' : 'Create Wild Card'}
            loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
            isDisabled={isPending}
          />
        </DialogFooter>
      </>
    );
  },
});

export function WildcardForm({ seriesId, open, onOpenChange, initialData }: iWildcardFormProps) {
  const { createWildcard, isPending: isCreating } = useCreateWildcard();
  const { updateWildcard, isPending: isUpdating } = useUpdateWildcard();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      title: initialData?.title ?? '',
      body: initialData?.body ?? '',
      tag: initialData?.tag ?? '',
    },
    onSubmit: async ({ value }) => {
      if (isEditMode && initialData) {
        updateWildcard(
          {
            id: initialData._id,
            seriesId,
            patch: {
              title: value.title,
              body: value.body || undefined,
              tag: value.tag || undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createWildcard(
          {
            seriesId,
            value: {
              title: value.title,
              body: value.body || undefined,
              tag: value.tag || undefined,
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
      onSubmit: wildcardFormSchema,
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        title: initialData.title,
        body: initialData.body ?? '',
        tag: initialData.tag ?? '',
      });
    } else if (!open) {
      form.reset({
        title: '',
        body: '',
        tag: '',
      });
    }
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Wild Card' : 'Create Wild Card'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the Wild Card details below.'
              : 'Add a new Wild Card to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <WildcardFormFields
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

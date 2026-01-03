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

import { useCreateWildcard } from '../hooks/mutations/use-create-wildcard';
import { useUpdateWildcard } from '../hooks/mutations/use-update-wildcard';

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
      const normalizedTitle = value.title.trim();
      const normalizedBody = value.body.trim();
      const normalizedTag = value.tag.trim();

      if (isEditMode && initialData) {
        updateWildcard(
          {
            id: initialData._id,
            seriesId,
            patch: {
              title: normalizedTitle,
              body: normalizedBody || undefined,
              tag: normalizedTag || undefined,
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
              title: normalizedTitle,
              body: normalizedBody || undefined,
              tag: normalizedTag || undefined,
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
        title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
        body: z.string().trim().max(1000, 'Content must be 1000 characters or less'),
        tag: z.string().trim().max(50, 'Tag must be 50 characters or less'),
      }),
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Wild Card' : 'Create Wild Card'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the Wild Card details below.'
              : 'Add a new Wild Card to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" placeholder="Enter Wild Card title" required />}
          </form.AppField>

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

          <form.AppField name="tag">
            {(field) => <field.TextField label="Tag" placeholder="Optional tag for categorization" maxLength={50} />}
          </form.AppField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <form.SubmitButton isDisabled={isPending}>
              {(() => {
                if (isPending) {
                  return isEditMode ? 'Updating...' : 'Creating...';
                }
                return isEditMode ? 'Update Wild Card' : 'Create Wild Card';
              })()}
            </form.SubmitButton>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

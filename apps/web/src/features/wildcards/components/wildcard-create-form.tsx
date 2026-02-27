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

import { useCreateWildcard } from '../hooks/mutations/use-create-wildcard';
import { wildcardFormSchema } from '../schemas/wildcard.schema';
import { WildcardFormFields } from './wildcard-form-fields';

interface iWildcardCreateFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create form for wildcards.
 * Renders in a dialog with manual submit.
 */
export function WildcardCreateForm({ seriesId, open, onOpenChange }: iWildcardCreateFormProps) {
  const { createWildcard, isPending } = useCreateWildcard();

  const form = useAppForm({
    defaultValues: {
      title: '',
      body: '',
      tag: '',
    },
    onSubmit: async ({ value }) => {
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
    },
    validators: {
      onSubmit: wildcardFormSchema,
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
          <DialogTitle>Create Wild Card</DialogTitle>
          <DialogDescription>Add a new Wild Card to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <WildcardFormFields form={form} />

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Wild Card"
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

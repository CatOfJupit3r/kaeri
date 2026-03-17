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
import { useCreateWorkspace } from '@~/hooks/mutations/use-create-workspace';

interface iCreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less'),
});

export function CreateWorkspaceDialog({ open, onOpenChange }: iCreateWorkspaceDialogProps) {
  const { createWorkspace, isPending } = useCreateWorkspace();

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      createWorkspace(
        {
          name: value.name,
          description: value.description || undefined,
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
      onSubmit: createWorkspaceSchema,
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
      <DialogContent>
        <form.AppForm>
          <form.Form className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>Create a new workspace to collaborate with your team.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <form.AppField name="name">
                {(field) => <field.TextField label="Name" placeholder="My Workspace" required />}
              </form.AppField>

              <form.AppField name="description">
                {(field) => (
                  <field.TextareaField
                    label="Description (optional)"
                    placeholder="A brief description of your workspace..."
                  />
                )}
              </form.AppField>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

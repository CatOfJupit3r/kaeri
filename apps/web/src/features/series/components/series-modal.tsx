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

import { useCreateSeries } from '../hooks/mutations/use-create-series';

interface iSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeriesModal({ open, onOpenChange }: iSeriesModalProps) {
  const { createSeries, isPending } = useCreateSeries();

  const form = useAppForm({
    defaultValues: {
      title: '',
      genre: '',
      logline: '',
      coverUrl: '',
    },
    onSubmit: async ({ value }) => {
      createSeries(
        {
          title: value.title,
          genre: value.genre || undefined,
          logline: value.logline || undefined,
          coverUrl: value.coverUrl || undefined,
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
      onSubmit: z.object({
        title: z.string().min(1, 'Title is required'),
        genre: z.string(),
        logline: z.string(),
        coverUrl: z.union([z.string().url('Must be a valid URL'), z.literal('')]),
      }),
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        title: '',
        genre: '',
        logline: '',
        coverUrl: '',
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Create a new series project. Fill in the details below to get started.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <form.AppField name="title">
              {(field) => <field.TextField label="Title" placeholder="Enter series title" required />}
            </form.AppField>

            <form.AppField name="genre">
              {(field) => <field.TextField label="Genre" placeholder="e.g., Drama, Comedy, Thriller" />}
            </form.AppField>

            <form.AppField name="logline">
              {(field) => (
                <field.TextareaField label="Logline" placeholder="Brief description of your series..." rows={3} />
              )}
            </form.AppField>

            <form.AppField name="coverUrl">
              {(field) => <field.TextField label="Cover URL" placeholder="https://example.com/cover.jpg" />}
            </form.AppField>
          </form.Form>
        </form.AppForm>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <form.SubmitButton isDisabled={isPending}>{isPending ? 'Creating...' : 'Create Project'}</form.SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

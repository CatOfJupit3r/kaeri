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

import { useCreateTimeline } from '../hooks/mutations/use-create-timeline';
import { timelineFormSchema } from '../schemas/timeline.schema';
import { TimelineFormFields } from './timeline-form-fields';

interface iTimelineCreateFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create form for timeline entries.
 * Renders in a dialog with manual submit.
 */
export function TimelineCreateForm({ seriesId, open, onOpenChange }: iTimelineCreateFormProps) {
  const { createTimeline, isPending } = useCreateTimeline();

  const form = useAppForm({
    defaultValues: {
      label: '',
      timestamp: '',
    },
    onSubmit: async ({ value }) => {
      createTimeline(
        {
          seriesId,
          value: {
            label: value.label,
            timestamp: value.timestamp || undefined,
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
      onSubmit: timelineFormSchema,
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
          <DialogTitle>Create Timeline Entry</DialogTitle>
          <DialogDescription>Add a new timeline entry to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <TimelineFormFields form={form} />

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Entry"
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

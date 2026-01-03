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

import { useCreateTimeline } from '../hooks/mutations/use-create-timeline';
import { useUpdateTimeline } from '../hooks/mutations/use-update-timeline';

interface iTimelineEntry {
  _id: string;
  label: string;
  timestamp?: string;
  order?: number;
}

interface iTimelineFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iTimelineEntry;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const TimelineFormFields = withForm({
  defaultValues: {
    label: '',
    timestamp: '',
  },
  props: {
    isPending: false,
    onCancel: () => {},
    isEditMode: false,
  },
  render: function Render({ form, isPending, onCancel, isEditMode }) {
    return (
      <>
        <form.AppField name="label">
          {(field) => <field.TextField label="Label" placeholder="Enter timeline label" required />}
        </form.AppField>

        <form.AppField name="timestamp">
          {(field) => (
            <field.TextField
              label="Date"
              placeholder="YYYY-MM-DD"
              type="date"
              description="Optional: Provide a date for chronological ordering (YYYY-MM-DD)"
            />
          )}
        </form.AppField>

        <DialogFooter>
          <form.FormActions
            onCancel={onCancel}
            submitLabel={isEditMode ? 'Update Entry' : 'Create Entry'}
            loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
            isDisabled={isPending}
          />
        </DialogFooter>
      </>
    );
  },
});

export function TimelineForm({ seriesId, open, onOpenChange, initialData }: iTimelineFormProps) {
  const { createTimeline, isPending: isCreating } = useCreateTimeline();
  const { updateTimeline, isPending: isUpdating } = useUpdateTimeline();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      label: initialData?.label ?? '',
      timestamp: initialData?.timestamp ?? '',
    },
    onSubmit: async ({ value }) => {
      const normalizedLabel = value.label.trim();
      const normalizedTimestamp = value.timestamp.trim();

      if (isEditMode && initialData) {
        updateTimeline(
          {
            id: initialData._id,
            seriesId,
            patch: {
              label: normalizedLabel,
              timestamp: normalizedTimestamp || undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createTimeline(
          {
            seriesId,
            value: {
              label: normalizedLabel,
              timestamp: normalizedTimestamp || undefined,
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
        label: z.string().trim().min(1, 'Label is required').max(200, 'Label must be 200 characters or less'),
        timestamp: z
          .string()
          .trim()
          .refine((val) => !val || DATE_REGEX.test(val), {
            message: 'Use YYYY-MM-DD format',
          }),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        label: initialData.label,
        timestamp: initialData.timestamp ?? '',
      });
    } else if (!open) {
      form.reset({
        label: '',
        timestamp: '',
      });
    }
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Timeline Entry' : 'Create Timeline Entry'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the timeline entry details below.'
              : 'Add a new timeline entry to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <TimelineFormFields
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

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

import { useCreateSeries } from '../hooks/mutations/use-create-series';
import { useUpdateSeries } from '../hooks/mutations/use-update-series';

interface iSeriesData {
  _id: string;
  title: string;
  genre?: string;
  logline?: string;
  coverUrl?: string;
}

interface iSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iSeriesData;
}

const SeriesFormFields = withForm({
  defaultValues: {
    title: '',
    genre: '',
    logline: '',
    coverUrl: '',
  },
  props: {
    isPending: false,
    onCancel: () => {},
    isEditMode: false,
  },
  render: function Render({ form, isPending, onCancel, isEditMode }) {
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <form.AppField name="title">
              {(field) => <field.TextField label="Title" placeholder="Enter series title" required />}
            </form.AppField>
          </div>

          <form.AppField name="genre">
            {(field) => <field.TextField label="Genre" placeholder="e.g., Drama, Comedy, Thriller" />}
          </form.AppField>

          <form.AppField name="coverUrl">
            {(field) => <field.TextField label="Cover URL" placeholder="https://example.com/cover.jpg" />}
          </form.AppField>
        </div>

        <form.AppField name="logline">
          {(field) => (
            <field.TextareaField label="Logline" placeholder="Brief description of your series..." rows={3} />
          )}
        </form.AppField>

        <DialogFooter>
          <form.FormActions
            onCancel={onCancel}
            submitLabel={isEditMode ? 'Save Changes' : 'Create Project'}
            loadingLabel={isEditMode ? 'Saving...' : 'Creating...'}
            isDisabled={isPending}
          />
        </DialogFooter>
      </>
    );
  },
});

export function SeriesModal({ open, onOpenChange, initialData }: iSeriesModalProps) {
  const { createSeries, isPending: isCreating } = useCreateSeries();
  const { updateSeries, isPending: isUpdating } = useUpdateSeries();
  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      title: initialData?.title ?? '',
      genre: initialData?.genre ?? '',
      logline: initialData?.logline ?? '',
      coverUrl: initialData?.coverUrl ?? '',
    },
    onSubmit: async ({ value }) => {
      if (isEditMode) {
        updateSeries(
          {
            seriesId: initialData._id,
            patch: {
              title: value.title,
              genre: value.genre || undefined,
              logline: value.logline || undefined,
              coverUrl: value.coverUrl || undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
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
      }
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
    if (open) {
      form.reset({
        title: initialData?.title ?? '',
        genre: initialData?.genre ?? '',
        logline: initialData?.logline ?? '',
        coverUrl: initialData?.coverUrl ?? '',
      });
    } else if (!isEditMode) {
      form.reset({
        title: '',
        genre: '',
        logline: '',
        coverUrl: '',
      });
    }
  }, [open, form, initialData, isEditMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your series project details below.'
              : 'Create a new series project. Fill in the details below to get started.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <SeriesFormFields
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

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

import { useUpdateScript } from '../hooks/mutations/use-update-script';

interface iScriptData {
  _id: string;
  title: string;
  genre?: string;
  logline?: string;
  coverUrl?: string;
  authors?: string[];
}

interface iScriptSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: iScriptData;
}

const ScriptFormFields = withForm({
  defaultValues: {
    title: '',
    genre: '',
    logline: '',
    coverUrl: '',
  },
  props: {
    isPending: false,
    onCancel: () => {},
  },
  render: function Render({ form, isPending, onCancel }) {
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <form.AppField name="title">
              {(field) => <field.TextField label="Title" placeholder="Enter script title" required />}
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
            <field.TextareaField label="Logline" placeholder="Brief description of your script..." rows={3} />
          )}
        </form.AppField>

        <DialogFooter>
          <form.FormActions
            onCancel={onCancel}
            submitLabel="Save Changes"
            loadingLabel="Saving..."
            isDisabled={isPending}
          />
        </DialogFooter>
      </>
    );
  },
});

export function ScriptSettingsModal({ open, onOpenChange, script }: iScriptSettingsModalProps) {
  const { updateScript, isPending } = useUpdateScript();

  const form = useAppForm({
    defaultValues: {
      title: script.title,
      genre: script.genre ?? '',
      logline: script.logline ?? '',
      coverUrl: script.coverUrl ?? '',
    },
    onSubmit: async ({ value }) => {
      updateScript(
        {
          scriptId: script._id,
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
        title: script.title,
        genre: script.genre ?? '',
        logline: script.logline ?? '',
        coverUrl: script.coverUrl ?? '',
      });
    }
  }, [open, script, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Script Settings</DialogTitle>
          <DialogDescription>Update script metadata and settings.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0 md:p-0">
            <ScriptFormFields form={form} isPending={isPending} onCancel={() => onOpenChange(false)} />
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

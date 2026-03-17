import { useEffect } from 'react';
import { LuFileText, LuFilm, LuLibrary, LuTv } from 'react-icons/lu';
import z from 'zod';

import { Card } from '@~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm, withForm } from '@~/components/ui/field';
import { Label } from '@~/components/ui/label';
import { cn } from '@~/lib/utils';

import { useCreateSeries } from '../hooks/mutations/use-create-series';
import { useUpdateSeries } from '../hooks/mutations/use-update-series';

// Series type configuration matching shared contract
const SERIES_TYPE_OPTIONS = [
  {
    value: 'tv-series' as const,
    label: 'TV Series',
    description: 'Multi-episode television show with seasons',
    icon: LuTv,
  },
  {
    value: 'film-trilogy' as const,
    label: 'Film Trilogy',
    description: 'Connected series of feature films',
    icon: LuFilm,
  },
  {
    value: 'anthology' as const,
    label: 'Anthology',
    description: 'Collection of standalone stories',
    icon: LuLibrary,
  },
  {
    value: 'standalone' as const,
    label: 'Standalone',
    description: 'Single feature film or special',
    icon: LuFileText,
  },
] as const;

type SeriesTypeValue = (typeof SERIES_TYPE_OPTIONS)[number]['value'];

interface iSeriesData {
  _id: string;
  title: string;
  type?: SeriesTypeValue;
  genre?: string;
  logline?: string;
  coverUrl?: string;
}

interface iSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iSeriesData;
}

interface iTypeSelectorProps {
  value: SeriesTypeValue;
  onChange: (value: SeriesTypeValue) => void;
  disabled?: boolean;
}

function TypeSelector({ value, onChange, disabled }: iTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Project Type</Label>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Project type selection">
        {SERIES_TYPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          return (
            <Card
              key={option.value}
              className={cn(
                'cursor-pointer border-2 p-3 transition-all hover:border-foreground',
                isSelected ? 'border-foreground bg-accent' : 'border-border',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              onClick={() => !disabled && onChange(option.value)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                  e.preventDefault();
                  onChange(option.value);
                }
              }}
              tabIndex={disabled ? -1 : 0}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.label}: ${option.description}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center border-2',
                    isSelected ? 'border-foreground bg-primary text-primary-foreground' : 'border-border bg-muted',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const SeriesFormFields = withForm({
  defaultValues: {
    title: '',
    type: 'standalone' as SeriesTypeValue,
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
    const typeValue = form.getFieldValue('type') as SeriesTypeValue;

    return (
      <>
        {/* Type Selection Grid - Only show in create mode or always allow change? */}
        <TypeSelector
          value={typeValue}
          onChange={(newType) => form.setFieldValue('type', newType)}
          disabled={isPending}
        />

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
      type: initialData?.type ?? 'standalone',
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
              type: value.type,
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
            type: value.type,
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
        type: z.enum(['tv-series', 'film-trilogy', 'anthology', 'standalone']),
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
        type: initialData?.type ?? 'standalone',
        genre: initialData?.genre ?? '',
        logline: initialData?.logline ?? '',
        coverUrl: initialData?.coverUrl ?? '',
      });
    } else if (!isEditMode) {
      form.reset({
        title: '',
        type: 'standalone' as SeriesTypeValue,
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

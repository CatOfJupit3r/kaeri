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
import { useAppForm, withForm } from '@~/components/ui/field';
import { Label } from '@~/components/ui/label';
import { SingleSelect } from '@~/components/ui/select';

import { useCreateEpisode } from '../hooks/mutations/use-create-episode';
import { useUpdateEpisode } from '../hooks/mutations/use-update-episode';

// Episode status options matching shared contract
const EPISODE_STATUS_OPTIONS = [
  { value: 'outline', label: 'Outline' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
];

type EpisodeStatus = 'outline' | 'in_progress' | 'complete';

interface iEpisodeData {
  _id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description?: string;
  status: EpisodeStatus;
  airDate?: Date;
}

interface iEpisodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  initialData?: iEpisodeData | null;
}

function getButtonText(isPending: boolean, isEditMode: boolean): string {
  if (isPending) return 'Saving...';
  return isEditMode ? 'Save Changes' : 'Create Episode';
}

const EpisodeFormFields = withForm({
  defaultValues: {
    seasonNumber: 1,
    episodeNumber: 1,
    title: '',
    description: '',
    status: 'outline' as EpisodeStatus,
    airDate: '',
  },
  props: {
    isPending: false,
    onCancel: () => {},
    isEditMode: false,
  },
  render: function Render({ form, isPending, onCancel, isEditMode }) {
    const statusValue = form.getFieldValue('status') as EpisodeStatus;

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="seasonNumber">
            {(field) => <field.TextField type="number" label="Season" placeholder="1" required />}
          </form.AppField>

          <form.AppField name="episodeNumber">
            {(field) => <field.TextField type="number" label="Episode" placeholder="1" required />}
          </form.AppField>

          <div className="col-span-2">
            <form.AppField name="title">
              {(field) => <field.TextField label="Title" placeholder="Episode title" required />}
            </form.AppField>
          </div>

          <div className="col-span-2">
            <form.AppField name="description">
              {(field) => <field.TextareaField label="Description" placeholder="Brief episode summary..." />}
            </form.AppField>
          </div>

          <div className="col-span-1">
            <Label className="mb-2 block" htmlFor="episode-status">
              Status
            </Label>
            <SingleSelect
              value={statusValue}
              onValueChange={(val) => form.setFieldValue('status', (val ?? 'outline') as EpisodeStatus)}
              isDisabled={isPending}
              options={EPISODE_STATUS_OPTIONS}
              placeholder="Select status..."
            />
          </div>

          <form.AppField name="airDate">
            {(field) => <field.TextField type="date" label="Air Date (optional)" />}
          </form.AppField>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isPending} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {getButtonText(isPending, isEditMode)}
          </Button>
        </DialogFooter>
      </>
    );
  },
});

// Form validation schema
const episodeFormSchema = z.object({
  seasonNumber: z.number().int().min(1, 'Season must be at least 1'),
  episodeNumber: z.number().int().min(1, 'Episode must be at least 1'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000),
  status: z.enum(['outline', 'in_progress', 'complete']),
  airDate: z.string(),
});

export function EpisodeModal({ open, onOpenChange, seriesId, initialData }: iEpisodeModalProps) {
  const { createEpisode, isPending: isCreating } = useCreateEpisode();
  const { updateEpisode, isPending: isUpdating } = useUpdateEpisode();

  const isEditMode = !!initialData;
  const isPending = isCreating || isUpdating;

  const form = useAppForm({
    defaultValues: {
      seasonNumber: initialData?.seasonNumber ?? 1,
      episodeNumber: initialData?.episodeNumber ?? 1,
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? 'outline',
      airDate: initialData?.airDate ? new Date(initialData.airDate).toISOString().split('T')[0] : '',
    },
    validators: {
      onSubmit: episodeFormSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        seriesId,
        seasonNumber: value.seasonNumber,
        episodeNumber: value.episodeNumber,
        title: value.title,
        description: value.description || undefined,
        status: value.status,
        airDate: value.airDate ? new Date(value.airDate) : undefined,
      };

      if (isEditMode && initialData) {
        updateEpisode({ episodeId: initialData._id, patch: payload }, { onSuccess: () => onOpenChange(false) });
      } else {
        createEpisode(payload, { onSuccess: () => onOpenChange(false) });
      }
    },
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
        seasonNumber: initialData?.seasonNumber ?? 1,
        episodeNumber: initialData?.episodeNumber ?? 1,
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        status: initialData?.status ?? 'outline',
        airDate: initialData?.airDate ? new Date(initialData.airDate).toISOString().split('T')[0] : '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form is stable
  }, [open, initialData]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Episode' : 'New Episode'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the episode details below.' : 'Add a new episode to your series.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit().catch(() => {});
          }}
        >
          <EpisodeFormFields form={form} isPending={isPending} onCancel={handleCancel} isEditMode={isEditMode} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from 'react';

import { EditPanelWrapper } from '@~/components/forms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import type { iOptionType } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateLocation } from '../hooks/mutations/use-update-location';
import type { LocationQueryReturnType } from '../hooks/queries/use-location';
import { locationFormSchema } from '../schemas/location.schema';
import { LocationFormFields } from './location-form-fields';

interface iLocationEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: LocationQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LocationEditForm({ mode, seriesId, initialData, onClose, open, onOpenChange }: iLocationEditFormProps) {
  const { updateLocation, isPending: isUpdating } = useUpdateLocation();
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: propsData } = usePropList(seriesId, 100, 0);

  const isPanelMode = mode === EDIT_FORM_MODES.panel;

  const characterOptions: iOptionType[] = (charactersData?.items ?? []).map((char) => ({
    label: char.name,
    value: char._id,
  }));

  const propOptions: iOptionType[] = (propsData?.items ?? []).map((prop) => ({
    label: prop.name,
    value: prop._id,
  }));

  const form = useAppForm({
    defaultValues: {
      name: initialData.name,
      description: initialData.description ?? '',
      tags: initialData.tags ?? ([] as string[]),
      images: initialData.images ?? [],
      associatedCharacterIds: initialData.associatedCharacterIds ?? ([] as string[]),
      propIds: initialData.propIds ?? ([] as string[]),
      productionNotes: initialData.productionNotes ?? '',
      mood: initialData.mood ?? '',
      timeOfDay: initialData.timeOfDay ?? ([] as string[]),
    },
    onSubmit: async ({ value }) => {
      updateLocation(
        {
          id: initialData._id,
          seriesId,
          patch: {
            name: value.name || undefined,
            description: value.description || undefined,
            tags: value.tags.length > 0 ? value.tags : undefined,
            images: value.images.length > 0 ? value.images : undefined,
            associatedCharacterIds: value.associatedCharacterIds.length > 0 ? value.associatedCharacterIds : undefined,
            propIds: value.propIds.length > 0 ? value.propIds : undefined,
            productionNotes: value.productionNotes || undefined,
            mood: value.mood || undefined,
            timeOfDay: value.timeOfDay.length > 0 ? value.timeOfDay : undefined,
          },
        },
        {
          onSuccess: () => {
            if (!isPanelMode) {
              onOpenChange?.(false);
            }
          },
        },
      );
    },
    validators: {
      onSubmit: locationFormSchema,
    },
  });

  const { handleAutoSave, resetInitialization } = useAutoSave(form, {
    isUpdating,
    enabled: isPanelMode,
  });

  // Reset form initialization when initialData changes
  useEffect(() => {
    resetInitialization();
  }, [initialData._id, resetInitialization]);

  // --- PANEL MODE ---
  if (isPanelMode) {
    return (
      <EditPanelWrapper title="Edit Location" onClose={onClose}>
        <form.AppForm>
          <form.Form className="space-y-4 p-4">
            <LocationFormFields
              form={form}
              isPending={isUpdating}
              characterOptions={characterOptions}
              propOptions={propOptions}
              onFieldBlur={handleAutoSave}
              onFieldChange={handleAutoSave}
            />
          </form.Form>
        </form.AppForm>
      </EditPanelWrapper>
    );
  }

  // --- DIALOG MODE ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>Update the location details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <LocationFormFields
              form={form}
              isPending={isUpdating}
              characterOptions={characterOptions}
              propOptions={propOptions}
            />

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange?.(false)}
                submitLabel="Update Location"
                loadingLabel="Updating..."
                isDisabled={isUpdating}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

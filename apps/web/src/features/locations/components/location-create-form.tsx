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

import { useCreateLocation } from '../hooks/mutations/use-create-location';
import { locationFormSchema } from '../schemas/location.schema';
import type { iImage } from './location-form-fields';
import { LocationFormFields } from './location-form-fields';

interface iLocationCreateFormProps {
  seriesId: string;
  characters: Array<{ _id: string; name: string }>;
  props: Array<{ _id: string; name: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationCreateForm({ seriesId, characters, props, open, onOpenChange }: iLocationCreateFormProps) {
  const { createLocation, isPending } = useCreateLocation();

  const characterOptions: iOptionType[] = characters.map((char) => ({
    label: char.name,
    value: char._id,
  }));

  const propOptions: iOptionType[] = props.map((prop) => ({
    label: prop.name,
    value: prop._id,
  }));

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      tags: [] as string[],
      images: [] as iImage[],
      associatedCharacterIds: [] as string[],
      propIds: [] as string[],
      productionNotes: '',
      mood: '',
      timeOfDay: [] as string[],
    },
    onSubmit: async ({ value }) => {
      createLocation(
        {
          seriesId,
          value: {
            name: value.name,
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
            onOpenChange(false);
            form.reset();
          },
        },
      );
    },
    validators: {
      onSubmit: locationFormSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Location</DialogTitle>
          <DialogDescription>Add a new location to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <LocationFormFields
              form={form}
              isPending={isPending}
              characterOptions={characterOptions}
              propOptions={propOptions}
            />

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Location"
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

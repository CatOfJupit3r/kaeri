import { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';
import z from 'zod';

import { Badge } from '@~/components/ui/badge';
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
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { MultiSelect } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';

import { useCreateLocation } from '../hooks/mutations/use-create-location';
import { useUpdateLocation } from '../hooks/mutations/use-update-location';

interface iImage {
  url: string;
  caption?: string;
}

interface iLocation {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  images?: iImage[];
  associatedCharacterIds?: string[];
  propIds?: string[];
  productionNotes?: string;
  mood?: string;
  timeOfDay?: string[];
}

interface iLocationFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iLocation;
}

export function LocationForm({ seriesId, open, onOpenChange, initialData }: iLocationFormProps) {
  const { createLocation, isPending: isCreating } = useCreateLocation();
  const { updateLocation, isPending: isUpdating } = useUpdateLocation();
  const { data: charactersData } = useCharacterList(seriesId, 100, 0, { enabled: open });
  const { data: propsData } = usePropList(seriesId, 100, 0, { enabled: open });

  const [images, setImages] = useState<iImage[]>(initialData?.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const characterOptions = (charactersData?.items ?? []).map((char) => ({
    label: char.name,
    value: char._id,
  }));

  const propOptions = (propsData?.items ?? []).map((prop) => ({
    label: prop.name,
    value: prop._id,
  }));

  const timeOfDayOptions = [
    { label: 'Dawn', value: 'dawn' },
    { label: 'Morning', value: 'morning' },
    { label: 'Afternoon', value: 'afternoon' },
    { label: 'Evening', value: 'evening' },
    { label: 'Dusk', value: 'dusk' },
    { label: 'Night', value: 'night' },
  ];

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      tags: initialData?.tags ?? ([] as string[]),
      associatedCharacterIds: initialData?.associatedCharacterIds ?? ([] as string[]),
      propIds: initialData?.propIds ?? ([] as string[]),
      productionNotes: initialData?.productionNotes ?? '',
      mood: initialData?.mood ?? '',
      timeOfDay: initialData?.timeOfDay ?? ([] as string[]),
    },
    onSubmit: async ({ value }) => {
      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();
      const normalizedProductionNotes = value.productionNotes.trim();
      const normalizedMood = value.mood.trim();

      if (isEditMode && initialData) {
        updateLocation(
          {
            id: initialData._id,
            seriesId,
            patch: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              tags: value.tags.length > 0 ? value.tags : undefined,
              images: images.length > 0 ? images : undefined,
              associatedCharacterIds:
                value.associatedCharacterIds.length > 0 ? value.associatedCharacterIds : undefined,
              propIds: value.propIds.length > 0 ? value.propIds : undefined,
              productionNotes: normalizedProductionNotes || undefined,
              mood: normalizedMood || undefined,
              timeOfDay: value.timeOfDay.length > 0 ? value.timeOfDay : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createLocation(
          {
            seriesId,
            value: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              tags: value.tags.length > 0 ? value.tags : undefined,
              images: images.length > 0 ? images : undefined,
              associatedCharacterIds:
                value.associatedCharacterIds.length > 0 ? value.associatedCharacterIds : undefined,
              propIds: value.propIds.length > 0 ? value.propIds : undefined,
              productionNotes: normalizedProductionNotes || undefined,
              mood: normalizedMood || undefined,
              timeOfDay: value.timeOfDay.length > 0 ? value.timeOfDay : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
              setImages([]);
            },
          },
        );
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(500, 'Description must be 500 characters or less'),
        tags: z.array(z.string()),
        associatedCharacterIds: z.array(z.string()),
        propIds: z.array(z.string()),
        productionNotes: z.string().trim().max(1000, 'Production notes must be 1000 characters or less'),
        mood: z.string().trim().max(100, 'Mood must be 100 characters or less'),
        timeOfDay: z.array(z.string()),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        tags: initialData.tags ?? [],
        associatedCharacterIds: initialData.associatedCharacterIds ?? [],
        propIds: initialData.propIds ?? [],
        productionNotes: initialData.productionNotes ?? '',
        mood: initialData.mood ?? '',
        timeOfDay: initialData.timeOfDay ?? [],
      });
      setImages(initialData.images ?? []);
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
        tags: [],
        associatedCharacterIds: [],
        propIds: [],
        productionNotes: '',
        mood: '',
        timeOfDay: [],
      });
      setImages([]);
    }
  }, [open, initialData, form]);

  const handleAddImage = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) return;

    try {
      // eslint-disable-next-line no-new
      new URL(trimmedUrl);
      setImages([...images, { url: trimmedUrl, caption: newImageCaption.trim() || undefined }]);
      setNewImageUrl('');
      setNewImageCaption('');
    } catch {
      // Invalid URL, don't add
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Location' : 'Create Location'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the location details below.'
              : 'Add a new location to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <div className="grid gap-4">
              <form.AppField name="name">
                {(field) => <field.TextField label="Name" placeholder="Enter location name" required />}
              </form.AppField>

              <form.AppField name="description">
                {(field) => (
                  <field.TextareaField
                    label="Description"
                    placeholder="Describe the location..."
                    rows={3}
                    maxLength={500}
                  />
                )}
              </form.AppField>

              <div className="space-y-2">
                <Label htmlFor="images-url">Reference Images</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="images-url"
                      placeholder="Image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      disabled={isPending}
                    />
                    <Input
                      placeholder="Caption (optional)"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      disabled={isPending}
                      className="w-1/2"
                    />
                    <Button type="button" onClick={handleAddImage} disabled={isPending || !newImageUrl.trim()}>
                      Add
                    </Button>
                  </div>
                  {images.length > 0 ? (
                    <div className="space-y-2">
                      {images.map((image, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{image.url}</p>
                            {image.caption ? <p className="text-xs text-muted-foreground">{image.caption}</p> : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="rounded-full p-1 hover:bg-muted"
                            disabled={isPending}
                          >
                            <LuX className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <form.AppField name="associatedCharacterIds" mode="array">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="characters-select">Associated Characters</Label>
                    <MultiSelect
                      inputId="characters-select"
                      options={characterOptions}
                      value={field.state.value}
                      onValueChange={(value) => field.setValue(value ?? [])}
                      placeholder="Select characters..."
                      isDisabled={isPending}
                      isClearable
                    />
                  </div>
                )}
              </form.AppField>

              <form.AppField name="propIds" mode="array">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="props-select">Props Used</Label>
                    <MultiSelect
                      inputId="props-select"
                      options={propOptions}
                      value={field.state.value}
                      onValueChange={(value) => field.setValue(value ?? [])}
                      placeholder="Select props..."
                      isDisabled={isPending}
                      isClearable
                    />
                  </div>
                )}
              </form.AppField>

              <form.AppField name="productionNotes">
                {(field) => (
                  <field.TextareaField
                    label="Production Notes"
                    placeholder="Add production notes..."
                    rows={3}
                    maxLength={1000}
                  />
                )}
              </form.AppField>

              <form.AppField name="mood">
                {(field) => <field.TextField label="Mood" placeholder="Enter mood (e.g., tense, peaceful)" />}
              </form.AppField>

              <form.AppField name="timeOfDay" mode="array">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="time-of-day-select">Time of Day</Label>
                    <MultiSelect
                      inputId="time-of-day-select"
                      options={timeOfDayOptions}
                      value={field.state.value}
                      onValueChange={(value) => field.setValue(value ?? [])}
                      placeholder="Select time of day..."
                      isDisabled={isPending}
                      isClearable
                    />
                  </div>
                )}
              </form.AppField>
            </div>

            <form.Field name="tags" mode="array">
              {(field) => {
                const tags = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Add a tag (press Enter)"
                        disabled={isPending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const trimmedTag = input.value.trim();
                            if (trimmedTag && !tags.includes(trimmedTag)) {
                              field.pushValue(trimmedTag);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('tags') as HTMLInputElement;
                          if (input) {
                            const trimmedTag = input.value.trim();
                            if (trimmedTag && !tags.includes(trimmedTag)) {
                              field.pushValue(trimmedTag);
                              input.value = '';
                            }
                          }
                        }}
                        disabled={isPending}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => field.removeValue(index)}
                              className="ml-1 rounded-full hover:bg-muted"
                              disabled={isPending}
                            >
                              <LuX className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }}
            </form.Field>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel={isEditMode ? 'Update Location' : 'Create Location'}
                loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
                isDisabled={isPending}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

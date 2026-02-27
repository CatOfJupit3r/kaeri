import { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';

import { EditPanelWrapper } from '@~/components/forms';
import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
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
import type { iOptionType } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateLocation } from '../hooks/mutations/use-update-location';
import type { LocationQueryReturnType } from '../hooks/queries/use-location';
import { locationFormSchema } from '../schemas/location.schema';
import { LocationFormFields, TIME_OF_DAY_OPTIONS } from './location-form-fields';

interface iImage {
  url: string;
  caption?: string;
}

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

  const [images, setImages] = useState<iImage[]>(initialData.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

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
            images: images.length > 0 ? images : undefined,
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

  // Sync images when initialData changes
  useEffect(() => {
    resetInitialization();
    setImages(initialData.images ?? []);
  }, [initialData._id, initialData.images, resetInitialization]);

  const handleAddImage = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) return;

    try {
      // eslint-disable-next-line no-new
      new URL(trimmedUrl);
      setImages([...images, { url: trimmedUrl, caption: newImageCaption.trim() || undefined }]);
      setNewImageUrl('');
      setNewImageCaption('');
      if (isPanelMode) handleAutoSave();
    } catch {
      // Invalid URL, don't add
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    if (isPanelMode) handleAutoSave();
  };

  // --- PANEL MODE ---
  if (isPanelMode) {
    return (
      <EditPanelWrapper title="Edit Location" onClose={onClose}>
        <form.AppForm>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Core details about this location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label="Name"
                        placeholder="Enter location name"
                        required
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="mood">
                    {(field) => (
                      <field.TextField
                        label="Mood"
                        placeholder="Enter mood (e.g., tense, peaceful)"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>

                <div className="mt-4">
                  <form.AppField name="description">
                    {(field) => (
                      <field.TextareaField
                        label="Description"
                        placeholder="Describe the location's atmosphere, key features, and significance..."
                        rows={4}
                        maxLength={500}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>

                {/* Tags */}
                <div className="mt-4">
                  <form.Field name="tags" mode="array">
                    {(field) => {
                      const tags = field.state.value || [];
                      return (
                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags</Label>
                          <div className="flex gap-2">
                            <Input
                              id="tags"
                              placeholder="Add tag (Enter)"
                              disabled={isUpdating}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const trimmedTag = input.value.trim();
                                  if (trimmedTag && !tags.includes(trimmedTag)) {
                                    field.pushValue(trimmedTag);
                                    input.value = '';
                                    handleAutoSave();
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.getElementById('tags') as HTMLInputElement;
                                if (input) {
                                  const trimmedTag = input.value.trim();
                                  if (trimmedTag && !tags.includes(trimmedTag)) {
                                    field.pushValue(trimmedTag);
                                    input.value = '';
                                    handleAutoSave();
                                  }
                                }
                              }}
                              disabled={isUpdating}
                            >
                              Add
                            </Button>
                          </div>
                          {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {tags.map((tag, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.removeValue(index);
                                      handleAutoSave();
                                    }}
                                    className="ml-1 rounded-full hover:bg-muted"
                                    disabled={isUpdating}
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
                </div>
              </CardContent>
            </Card>

            {/* Three-column layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Reference Images */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Reference Images</CardTitle>
                  <CardDescription>Visual references for this location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="Image URL"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        disabled={isUpdating}
                      />
                      <Input
                        placeholder="Caption (optional)"
                        value={newImageCaption}
                        onChange={(e) => setNewImageCaption(e.target.value)}
                        disabled={isUpdating}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddImage}
                        disabled={isUpdating || !newImageUrl.trim()}
                        className="w-full"
                      >
                        Add Image
                      </Button>
                    </div>
                    {images.length > 0 ? (
                      <div className="space-y-2">
                        {images.map((image, index) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{image.url}</p>
                              {image.caption ? (
                                <p className="truncate text-xs text-muted-foreground">{image.caption}</p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="rounded-full p-1 hover:bg-muted"
                              disabled={isUpdating}
                            >
                              <LuX className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">No images added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Associations */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Associations</CardTitle>
                  <CardDescription>Related characters and props</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.AppField name="associatedCharacterIds">
                    {(field) => (
                      <field.MultiSelectField
                        label="Characters"
                        options={characterOptions}
                        placeholder="Select characters..."
                        isDisabled={isUpdating}
                        isClearable
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="propIds">
                    {(field) => (
                      <field.MultiSelectField
                        label="Props"
                        options={propOptions}
                        placeholder="Select props..."
                        isDisabled={isUpdating}
                        isClearable
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Settings</CardTitle>
                  <CardDescription>Time and production details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.AppField name="timeOfDay">
                    {(field) => (
                      <field.MultiSelectField
                        label="Time of Day"
                        options={[...TIME_OF_DAY_OPTIONS]}
                        placeholder="Select time of day..."
                        isDisabled={isUpdating}
                        isClearable
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="productionNotes">
                    {(field) => (
                      <field.TextareaField
                        label="Production Notes"
                        placeholder="Add production notes..."
                        rows={4}
                        maxLength={1000}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </CardContent>
              </Card>
            </div>
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
            <div className="grid gap-4">
              <LocationFormFields form={form} isPending={isUpdating} />

              {/* Reference Images */}
              <div className="space-y-2">
                <Label htmlFor="images-url">Reference Images</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="images-url"
                      placeholder="Image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      disabled={isUpdating}
                    />
                    <Input
                      placeholder="Caption (optional)"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      disabled={isUpdating}
                      className="w-1/2"
                    />
                    <Button type="button" onClick={handleAddImage} disabled={isUpdating || !newImageUrl.trim()}>
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
                            disabled={isUpdating}
                          >
                            <LuX className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Associations */}
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
                      isDisabled={isUpdating}
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
                      isDisabled={isUpdating}
                      isClearable
                    />
                  </div>
                )}
              </form.AppField>

              <form.AppField name="timeOfDay" mode="array">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="time-of-day-select">Time of Day</Label>
                    <MultiSelect
                      inputId="time-of-day-select"
                      options={[...TIME_OF_DAY_OPTIONS]}
                      value={field.state.value}
                      onValueChange={(value) => field.setValue(value ?? [])}
                      placeholder="Select time of day..."
                      isDisabled={isUpdating}
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

              {/* Tags */}
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
                          disabled={isUpdating}
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
                          disabled={isUpdating}
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
                                disabled={isUpdating}
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
            </div>

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

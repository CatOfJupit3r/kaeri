import { useEffect, useState } from 'react';
import { LuArrowLeft, LuX } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Separator } from '@~/components/ui/separator';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useAutoSave } from '@~/hooks/use-auto-save';

import { useUpdateLocation } from '../hooks/mutations/use-update-location';
import { useLocation } from '../hooks/queries/use-location';
import { locationFormSchema } from '../schemas/location.schema';

interface iImage {
  url: string;
  caption?: string;
}

interface iLocationEditPanelProps {
  locationId: string;
  seriesId: string;
  onClose: () => void;
}

const TIME_OF_DAY_OPTIONS = [
  { label: 'Dawn', value: 'dawn' },
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
  { label: 'Dusk', value: 'dusk' },
  { label: 'Night', value: 'night' },
];

export function LocationEditPanel({ locationId, seriesId, onClose }: iLocationEditPanelProps) {
  const { data: location, isPending: isLoading, error } = useLocation(locationId, seriesId);
  const { updateLocation, isPending: isUpdating } = useUpdateLocation();
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: propsData } = usePropList(seriesId, 100, 0);

  const [images, setImages] = useState<iImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  const characterOptions = (charactersData?.items ?? []).map((char) => ({
    label: char.name,
    value: char._id,
  }));

  const propOptions = (propsData?.items ?? []).map((prop) => ({
    label: prop.name,
    value: prop._id,
  }));

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      tags: [] as string[],
      associatedCharacterIds: [] as string[],
      propIds: [] as string[],
      productionNotes: '',
      mood: '',
      timeOfDay: [] as string[],
    },
    onSubmit: async ({ value }) => {
      if (!location) return;

      updateLocation({
        id: location._id,
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
      });
    },
    validators: {
      onSubmit: locationFormSchema,
    },
  });

  const { handleAutoSave, resetInitialization } = useAutoSave(form, { isUpdating });

  // Sync form with location data when loaded
  useEffect(() => {
    if (location) {
      resetInitialization();
      form.reset({
        name: location.name,
        description: location.description ?? '',
        tags: location.tags ?? [],
        associatedCharacterIds: location.associatedCharacterIds ?? [],
        propIds: location.propIds ?? [],
        productionNotes: location.productionNotes ?? '',
        mood: location.mood ?? '',
        timeOfDay: location.timeOfDay ?? [],
      });
      setImages(location.images ?? []);
    }
  }, [location, form, resetInitialization]);

  const handleAddImage = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) return;

    try {
      // eslint-disable-next-line no-new
      new URL(trimmedUrl);
      setImages([...images, { url: trimmedUrl, caption: newImageCaption.trim() || undefined }]);
      setNewImageUrl('');
      setNewImageCaption('');
      handleAutoSave();
    } catch {
      // Invalid URL, don't add
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    handleAutoSave();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading location...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Location not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-foreground bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <LuArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-lg font-bold">Edit Location</h2>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <form.AppForm>
          <form.Form className="p-4">
            {/* Basic Info Section - 2 columns */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Core details about this location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Name */}
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

                  {/* Mood */}
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

                {/* Description - full width */}
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

            {/* Three-column layout for Images, Associations, and Settings */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Reference Images Section */}
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

              {/* Associations Section */}
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

              {/* Settings Section */}
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
                        options={TIME_OF_DAY_OPTIONS}
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
      </ScrollArea>
    </div>
  );
}

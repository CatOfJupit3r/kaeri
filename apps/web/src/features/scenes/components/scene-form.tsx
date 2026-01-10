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
import { SingleSelect } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

import { useCreateScene } from '../hooks/mutations/use-create-scene';
import { useUpdateScene } from '../hooks/mutations/use-update-scene';
import type { SceneDetailQueryReturnType } from '../hooks/queries/use-scene';
import type { SceneListItem } from '../hooks/queries/use-scene-list';

interface iSceneBeat {
  order: number;
  description: string;
}
type Scene = SceneDetailQueryReturnType | SceneListItem;

interface iSceneFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Scene;
}

export function SceneForm({ seriesId, open, onOpenChange, initialData }: iSceneFormProps) {
  const { createScene, isPending: isCreating } = useCreateScene();
  const { updateScene, isPending: isUpdating } = useUpdateScene();
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: locationsData } = useLocationList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId);
  const { data: propsData } = usePropList(seriesId);

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const [beatInput, setBeatInput] = useState('');

  const fullSceneData = initialData && 'beats' in initialData ? initialData : null;

  const form = useAppForm({
    defaultValues: {
      scriptId: initialData?.scriptId ?? '',
      heading: fullSceneData?.heading ?? '',
      locationId: initialData?.locationId ?? '',
      timeOfDay: fullSceneData?.timeOfDay ?? '',
      duration: fullSceneData?.duration ?? '',
      emotionalTone: initialData?.emotionalTone ?? '',
      conflict: fullSceneData?.conflict ?? '',
      beats: fullSceneData?.beats ?? ([] as iSceneBeat[]),
      characterIds: initialData?.characterIds ?? ([] as string[]),
      propIds: fullSceneData?.propIds ?? ([] as string[]),
      lighting: fullSceneData?.lighting ?? '',
      sound: fullSceneData?.sound ?? '',
      camera: fullSceneData?.camera ?? '',
      storyNotes: fullSceneData?.storyNotes ?? '',
      storyboardUrl: fullSceneData?.storyboardUrl ?? '',
    },
    onSubmit: async ({ value }) => {
      const normalizedHeading = value.heading.trim();

      if (isEditMode && initialData) {
        updateScene(
          {
            sceneId: initialData._id,
            patch: {
              heading: normalizedHeading,
              locationId: value.locationId || undefined,
              timeOfDay: value.timeOfDay || undefined,
              duration: value.duration || undefined,
              emotionalTone: value.emotionalTone || undefined,
              conflict: value.conflict || undefined,
              beats: value.beats.length > 0 ? value.beats : undefined,
              characterIds: value.characterIds.length > 0 ? value.characterIds : undefined,
              propIds: value.propIds.length > 0 ? value.propIds : undefined,
              lighting: value.lighting || undefined,
              sound: value.sound || undefined,
              camera: value.camera || undefined,
              storyNotes: value.storyNotes || undefined,
              storyboardUrl: value.storyboardUrl || undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createScene(
          {
            seriesId,
            scriptId: value.scriptId,
            heading: normalizedHeading,
            locationId: value.locationId || undefined,
            timeOfDay: value.timeOfDay || undefined,
            duration: value.duration || undefined,
            emotionalTone: value.emotionalTone || undefined,
            conflict: value.conflict || undefined,
            beats: value.beats.length > 0 ? value.beats : undefined,
            characterIds: value.characterIds.length > 0 ? value.characterIds : undefined,
            propIds: value.propIds.length > 0 ? value.propIds : undefined,
            lighting: value.lighting || undefined,
            sound: value.sound || undefined,
            camera: value.camera || undefined,
            storyNotes: value.storyNotes || undefined,
            storyboardUrl: value.storyboardUrl || undefined,
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
        scriptId: z.string().min(1, 'Script is required'),
        heading: z.string().trim().min(1, 'Heading is required').max(200, 'Heading must be 200 characters or less'),
        locationId: z.string(),
        timeOfDay: z.string(),
        duration: z.string(),
        emotionalTone: z.string(),
        conflict: z.string(),
        beats: z.array(
          z.object({
            order: z.number(),
            description: z.string(),
          }),
        ),
        characterIds: z.array(z.string()),
        propIds: z.array(z.string()),
        lighting: z.string(),
        sound: z.string(),
        camera: z.string(),
        storyNotes: z.string(),
        storyboardUrl: z
          .string()
          .trim()
          .refine((val) => !val || z.string().url().safeParse(val).success, {
            message: 'Must be a valid URL',
          }),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      const fullData = initialData && 'beats' in initialData ? initialData : null;
      form.reset({
        scriptId: initialData.scriptId,
        heading: fullData?.heading ?? '',
        locationId: initialData.locationId ?? '',
        timeOfDay: fullData?.timeOfDay ?? '',
        duration: fullData?.duration ?? '',
        emotionalTone: initialData.emotionalTone ?? '',
        conflict: fullData?.conflict ?? '',
        beats: fullData?.beats ?? [],
        characterIds: initialData.characterIds ?? [],
        propIds: fullData?.propIds ?? [],
        lighting: fullData?.lighting ?? '',
        sound: fullData?.sound ?? '',
        camera: fullData?.camera ?? '',
        storyNotes: fullData?.storyNotes ?? '',
        storyboardUrl: fullData?.storyboardUrl ?? '',
      });
    } else if (!open) {
      form.reset({
        scriptId: '',
        heading: '',
        locationId: '',
        timeOfDay: '',
        duration: '',
        emotionalTone: '',
        conflict: '',
        beats: [],
        characterIds: [],
        propIds: [],
        lighting: '',
        sound: '',
        camera: '',
        storyNotes: '',
        storyboardUrl: '',
      });
      setBeatInput('');
    }
  }, [open, initialData, form]);

  const scripts = scriptsData?.items ?? [];
  const locations = locationsData?.items ?? [];
  const characters = charactersData?.items ?? [];
  const props = propsData?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Scene' : 'Create Scene'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the scene details below.' : 'Add a new scene to your script.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <form.Field name="scriptId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Script <span className="text-destructive">*</span>
                  </Label>
                  <SingleSelect
                    inputId={field.name}
                    value={field.state.value || null}
                    onValueChange={(value) => field.handleChange(value ?? '')}
                    options={scripts.map((script) => ({ label: script.title, value: script._id }))}
                    placeholder="Select a script"
                    isDisabled={isPending || isEditMode}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.AppField name="heading">
              {(field) => (
                <field.TextField label="Heading" placeholder="INT. COFFEE SHOP - DAY" required maxLength={200} />
              )}
            </form.AppField>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="locationId">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Location</Label>
                    <SingleSelect
                      inputId={field.name}
                      value={field.state.value || null}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      options={locations.map((location) => ({ label: location.name, value: location._id }))}
                      placeholder="Select a location"
                      isClearable
                      isDisabled={isPending}
                    />
                  </div>
                )}
              </form.Field>

              <form.AppField name="timeOfDay">
                {(field) => <field.TextField label="Time of Day" placeholder="Night" />}
              </form.AppField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="duration">
                {(field) => <field.TextField label="Duration" placeholder="2 pages" />}
              </form.AppField>

              <form.AppField name="emotionalTone">
                {(field) => <field.TextField label="Emotional Tone" placeholder="Tense, Chaotic" />}
              </form.AppField>
            </div>

            <form.AppField name="conflict">
              {(field) => (
                <field.TextareaField
                  label="Conflict"
                  placeholder="Describe the conflict..."
                  rows={3}
                  maxLength={1000}
                />
              )}
            </form.AppField>

            <form.Field name="beats" mode="array">
              {(field) => {
                const beats = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="beats">Scene Beats</Label>
                    <div className="flex gap-2">
                      <Input
                        id="beats"
                        placeholder="Add a beat (press Enter)"
                        value={beatInput}
                        onChange={(e) => setBeatInput(e.target.value)}
                        disabled={isPending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = beatInput.trim();
                            if (trimmed) {
                              field.pushValue({ order: beats.length, description: trimmed });
                              setBeatInput('');
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const trimmed = beatInput.trim();
                          if (trimmed) {
                            field.pushValue({ order: beats.length, description: trimmed });
                            setBeatInput('');
                          }
                        }}
                        disabled={isPending}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {beats.length > 0 && (
                      <div className="space-y-2">
                        {beats.map((beat, index) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <div key={index} className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {index + 1}
                            </span>
                            <p className="flex-1 text-sm">{beat.description}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.removeValue(index)}
                              disabled={isPending}
                              className="h-6 w-6 p-0"
                            >
                              <LuX className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="characterIds" mode="array">
              {(field) => {
                const selectedIds = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="characterIds">Characters</Label>
                    <SingleSelect
                      inputId="characterIds"
                      value={null}
                      onValueChange={(value) => {
                        if (value && !selectedIds.includes(value)) {
                          field.pushValue(value);
                        }
                      }}
                      options={characters
                        .filter((char) => !selectedIds.includes(char._id))
                        .map((char) => ({ label: char.name, value: char._id }))}
                      placeholder="Add a character"
                      isDisabled={isPending}
                    />
                    {selectedIds.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedIds.map((id, index) => {
                          const character = characters.find((c) => c._id === id);
                          return (
                            // eslint-disable-next-line react/no-array-index-key
                            <Badge key={`${id}-${index}`} variant="secondary" className="gap-1">
                              {character?.name ?? 'Unknown'}
                              <button
                                type="button"
                                onClick={() => field.removeValue(index)}
                                className="ml-1 rounded-full hover:bg-muted"
                                disabled={isPending}
                              >
                                <LuX className="size-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="propIds" mode="array">
              {(field) => {
                const selectedIds = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="propIds">Props</Label>
                    <SingleSelect
                      inputId="propIds"
                      value={null}
                      onValueChange={(value) => {
                        if (value && !selectedIds.includes(value)) {
                          field.pushValue(value);
                        }
                      }}
                      options={props
                        .filter((prop) => !selectedIds.includes(prop._id))
                        .map((prop) => ({ label: prop.name, value: prop._id }))}
                      placeholder="Add a prop"
                      isDisabled={isPending}
                    />
                    {selectedIds.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedIds.map((id, index) => {
                          const prop = props.find((p) => p._id === id);
                          return (
                            // eslint-disable-next-line react/no-array-index-key
                            <Badge key={`${id}-${index}`} variant="outline" className="gap-1">
                              {prop?.name ?? 'Unknown'}
                              <button
                                type="button"
                                onClick={() => field.removeValue(index)}
                                className="ml-1 rounded-full hover:bg-muted"
                                disabled={isPending}
                              >
                                <LuX className="size-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Production Details</h3>

              <form.AppField name="lighting">
                {(field) => <field.TextareaField label="Lighting" placeholder="Neon strobes, fog..." rows={2} />}
              </form.AppField>

              <form.AppField name="sound">
                {(field) => <field.TextareaField label="Sound Design" placeholder="Loud techno music..." rows={2} />}
              </form.AppField>

              <form.AppField name="camera">
                {(field) => <field.TextareaField label="Camera" placeholder="Wide shots, close-ups..." rows={2} />}
              </form.AppField>
            </div>

            <form.AppField name="storyNotes">
              {(field) => (
                <field.TextareaField
                  label="Director's Notes"
                  placeholder="Story notes and directions..."
                  rows={3}
                  maxLength={2000}
                />
              )}
            </form.AppField>

            <form.AppField name="storyboardUrl">
              {(field) => <field.TextField label="Storyboard URL" placeholder="https://example.com/storyboard.jpg" />}
            </form.AppField>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel={isEditMode ? 'Update Scene' : 'Create Scene'}
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

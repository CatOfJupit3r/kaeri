import { useState } from 'react';
import { LuX } from 'react-icons/lu';

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

import { useCreateScene } from '../hooks/mutations/use-create-scene';
import { sceneFormSchema } from '../schemas/scene.schema';
import type { iSceneBeat } from './scene-form-fields';
import { SceneFormFields } from './scene-form-fields';

interface iSceneCreateFormProps {
  seriesId: string;
  scripts: Array<{ _id: string; title: string }>;
  locations: Array<{ _id: string; name: string }>;
  characters: Array<{ _id: string; name: string }>;
  props: Array<{ _id: string; name: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SceneCreateForm({
  seriesId,
  scripts,
  locations,
  characters,
  props,
  open,
  onOpenChange,
}: iSceneCreateFormProps) {
  const { createScene, isPending } = useCreateScene();
  const [beatInput, setBeatInput] = useState('');

  const form = useAppForm({
    defaultValues: {
      scriptId: '',
      heading: '',
      locationId: '',
      timeOfDay: '',
      duration: '',
      emotionalTone: '',
      conflict: '',
      beats: [] as iSceneBeat[],
      characterIds: [] as string[],
      propIds: [] as string[],
      lighting: '',
      sound: '',
      camera: '',
      storyNotes: '',
      storyboardUrl: '',
    },
    onSubmit: async ({ value }) => {
      createScene(
        {
          seriesId,
          scriptId: value.scriptId,
          heading: value.heading,
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
            setBeatInput('');
          },
        },
      );
    },
    validators: {
      onSubmit: sceneFormSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Scene</DialogTitle>
          <DialogDescription>Add a new scene to your script.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            {/* Script Selection */}
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
                    isDisabled={isPending}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <SceneFormFields form={form} isPending={isPending} />

            <div className="grid grid-cols-2 gap-4">
              {/* Location */}
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
                {(field) => <field.TextField label="Time of Day" placeholder="Night" disabled={isPending} />}
              </form.AppField>
            </div>

            {/* Beats */}
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

            {/* Characters */}
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

            {/* Props */}
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

            {/* Production Details */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Production Details</h3>

              <form.AppField name="lighting">
                {(field) => (
                  <field.TextareaField
                    label="Lighting"
                    placeholder="Neon strobes, fog..."
                    rows={2}
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="sound">
                {(field) => (
                  <field.TextareaField
                    label="Sound Design"
                    placeholder="Loud techno music..."
                    rows={2}
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="camera">
                {(field) => (
                  <field.TextareaField
                    label="Camera"
                    placeholder="Wide shots, close-ups..."
                    rows={2}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="storyNotes">
              {(field) => (
                <field.TextareaField
                  label="Director's Notes"
                  placeholder="Story notes and directions..."
                  rows={3}
                  maxLength={2000}
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="storyboardUrl">
              {(field) => (
                <field.TextField
                  label="Storyboard URL"
                  placeholder="https://example.com/storyboard.jpg"
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Scene"
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

import { useState } from 'react';
import { LuGripVertical, LuPlus, LuTrash2, LuX } from 'react-icons/lu';

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
import { SingleSelect } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateScene } from '../hooks/mutations/use-update-scene';
import type { SceneDetailQueryReturnType } from '../hooks/queries/use-scene';
import type { iSceneBeat } from './scene-form-fields';
import { SceneFormFields, TIME_OF_DAY_OPTIONS } from './scene-form-fields';

interface iSceneEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: SceneDetailQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SceneEditForm({ mode, seriesId, initialData, onClose, open, onOpenChange }: iSceneEditFormProps) {
  const { updateScene, isPending: isUpdating } = useUpdateScene();

  // Fetch data for dropdowns
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: locationsData } = useLocationList(seriesId, 100, 0);
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: propsData } = usePropList(seriesId, 100, 0);

  const scripts = scriptsData?.items ?? [];
  const locations = locationsData?.items ?? [];
  const characters = charactersData?.items ?? [];
  const props = propsData?.items ?? [];

  const isPanelMode = mode === EDIT_FORM_MODES.panel;

  // State for beats array (managed separately for easier reordering)
  const [beats, setBeats] = useState<iSceneBeat[]>(initialData.beats ?? []);
  const [beatInput, setBeatInput] = useState('');

  const form = useAppForm({
    defaultValues: {
      scriptId: initialData.scriptId,
      heading: initialData.heading,
      locationId: initialData.locationId ?? '',
      timeOfDay: initialData.timeOfDay ?? '',
      duration: initialData.duration ?? '',
      emotionalTone: initialData.emotionalTone ?? '',
      conflict: initialData.conflict ?? '',
      beats: initialData.beats ?? ([] as iSceneBeat[]),
      characterIds: initialData.characterIds ?? ([] as string[]),
      propIds: initialData.propIds ?? ([] as string[]),
      lighting: initialData.lighting ?? '',
      sound: initialData.sound ?? '',
      camera: initialData.camera ?? '',
      storyNotes: initialData.storyNotes ?? '',
      storyboardUrl: initialData.storyboardUrl ?? '',
    },
    onSubmit: async ({ value }) => {
      updateScene(
        {
          sceneId: initialData._id,
          patch: {
            heading: value.heading || undefined,
            locationId: value.locationId || undefined,
            timeOfDay: value.timeOfDay || undefined,
            duration: value.duration || undefined,
            emotionalTone: value.emotionalTone || undefined,
            conflict: value.conflict || undefined,
            lighting: value.lighting || undefined,
            sound: value.sound || undefined,
            camera: value.camera || undefined,
            storyNotes: value.storyNotes || undefined,
            storyboardUrl: value.storyboardUrl || undefined,
            beats: beats.length > 0 ? beats : undefined,
            characterIds: value.characterIds.length > 0 ? value.characterIds : undefined,
            propIds: value.propIds.length > 0 ? value.propIds : undefined,
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
  });

  const { handleAutoSave } = useAutoSave(form, { isUpdating, enabled: isPanelMode });

  // Beat management
  const handleAddBeat = () => {
    if (beatInput.trim()) {
      const newBeats = [...beats, { order: beats.length, description: beatInput.trim() }];
      setBeats(newBeats);
      setBeatInput('');
      if (isPanelMode) handleAutoSave();
    }
  };

  const handleRemoveBeat = (index: number) => {
    const updatedBeats = beats.filter((_, i) => i !== index);
    setBeats(updatedBeats.map((b, i) => ({ ...b, order: i })));
    if (isPanelMode) handleAutoSave();
  };

  const handleMoveBeatUp = (index: number) => {
    if (index === 0) return;
    const newBeats = [...beats];
    [newBeats[index - 1], newBeats[index]] = [newBeats[index], newBeats[index - 1]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
    if (isPanelMode) handleAutoSave();
  };

  const handleMoveBeatDown = (index: number) => {
    if (index === beats.length - 1) return;
    const newBeats = [...beats];
    [newBeats[index], newBeats[index + 1]] = [newBeats[index + 1], newBeats[index]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
    if (isPanelMode) handleAutoSave();
  };

  const script = scripts.find((s) => s._id === initialData.scriptId);

  // --- PANEL MODE ---
  if (isPanelMode) {
    return (
      <EditPanelWrapper title={`Edit Scene #${initialData.sceneNumber}`} onClose={onClose}>
        <form.AppForm key={initialData._id}>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>
                  Scene in script: <span className="font-medium">{script?.title ?? 'Unknown'}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form.AppField name="heading">
                  {(field) => (
                    <field.TextField
                      label="Scene Heading"
                      placeholder="e.g., INT. COFFEE SHOP - DAY"
                      required
                      onBlur={handleAutoSave}
                    />
                  )}
                </form.AppField>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <form.AppField name="locationId">
                    {(field) => (
                      <field.SelectField
                        label="Location"
                        options={[
                          { value: '', label: 'None' },
                          ...locations.map((l) => ({ value: l._id, label: l.name })),
                        ]}
                        placeholder="Select location"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="timeOfDay">
                    {(field) => (
                      <field.SelectField
                        label="Time of Day"
                        options={TIME_OF_DAY_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
                        placeholder="Select time"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="duration">
                    {(field) => (
                      <field.TextField label="Duration" placeholder="e.g., 2 min 30 sec" onBlur={handleAutoSave} />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Story Elements */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Story Elements</CardTitle>
                <CardDescription>Narrative elements of this scene</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="emotionalTone">
                    {(field) => (
                      <field.TextField
                        label="Emotional Tone"
                        placeholder="e.g., Tense, Romantic, Comedic"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="conflict">
                    {(field) => (
                      <field.TextField
                        label="Conflict"
                        placeholder="e.g., Character vs Character"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>

                <div className="mt-4">
                  <form.AppField name="storyNotes">
                    {(field) => (
                      <field.TextareaField
                        label="Story Notes"
                        placeholder="Additional notes about this scene's narrative purpose..."
                        rows={4}
                        maxLength={2000}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Scene Beats */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Scene Beats</CardTitle>
                <CardDescription>Key story beats in sequential order ({beats.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {beats.length > 0 ? (
                    <div className="space-y-2">
                      {beats.map((beat, index) => (
                        <div
                          key={beat.order}
                          className="flex items-center gap-2 rounded-md border border-border bg-card p-3"
                        >
                          <div className="flex flex-col">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveBeatUp(index)}
                              disabled={index === 0}
                              className="h-5 w-5 p-0"
                            >
                              <LuGripVertical className="size-3 rotate-90" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveBeatDown(index)}
                              disabled={index === beats.length - 1}
                              className="h-5 w-5 p-0"
                            >
                              <LuGripVertical className="size-3 rotate-90" />
                            </Button>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {index + 1}
                          </Badge>
                          <span className="flex-1 text-sm">{beat.description}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBeat(index)}
                            className="shrink-0 text-destructive hover:text-destructive"
                          >
                            <LuTrash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Character enters and confronts antagonist"
                      value={beatInput}
                      onChange={(e) => setBeatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBeat();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddBeat} disabled={!beatInput.trim()}>
                      <LuPlus className="mr-1 size-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Characters & Props */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Characters & Props</CardTitle>
                <CardDescription>Who and what appears in this scene</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <form.AppField name="characterIds">
                    {(field) => (
                      <field.MultiSelectField
                        label="Characters in Scene"
                        options={characters.map((c) => ({ value: c._id, label: c.name }))}
                        placeholder="Select characters..."
                        closeMenuOnSelect={false}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="propIds">
                    {(field) => (
                      <field.MultiSelectField
                        label="Props in Scene"
                        options={props.map((p) => ({ value: p._id, label: p.name }))}
                        placeholder="Select props..."
                        closeMenuOnSelect={false}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Technical Details</CardTitle>
                <CardDescription>Production notes for this scene</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <form.AppField name="lighting">
                    {(field) => (
                      <field.TextField label="Lighting" placeholder="e.g., Natural, Low-key" onBlur={handleAutoSave} />
                    )}
                  </form.AppField>

                  <form.AppField name="sound">
                    {(field) => (
                      <field.TextField label="Sound" placeholder="e.g., Ambient city noise" onBlur={handleAutoSave} />
                    )}
                  </form.AppField>

                  <form.AppField name="camera">
                    {(field) => (
                      <field.TextField
                        label="Camera"
                        placeholder="e.g., Wide establishing shot"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>

                <div className="mt-4">
                  <form.AppField name="storyboardUrl">
                    {(field) => (
                      <field.TextField label="Storyboard URL" placeholder="https://..." onBlur={handleAutoSave} />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>
          </form.Form>
        </form.AppForm>
      </EditPanelWrapper>
    );
  }

  // --- DIALOG MODE ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scene</DialogTitle>
          <DialogDescription>Update the scene details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <SceneFormFields form={form} isPending={isUpdating} />

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
                      isDisabled={isUpdating}
                    />
                  </div>
                )}
              </form.Field>

              <form.AppField name="timeOfDay">
                {(field) => <field.TextField label="Time of Day" placeholder="Night" disabled={isUpdating} />}
              </form.AppField>
            </div>

            {/* Beats */}
            <form.Field name="beats" mode="array">
              {(field) => {
                const formBeats = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="beats">Scene Beats</Label>
                    <div className="flex gap-2">
                      <Input
                        id="beats"
                        placeholder="Add a beat (press Enter)"
                        value={beatInput}
                        onChange={(e) => setBeatInput(e.target.value)}
                        disabled={isUpdating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = beatInput.trim();
                            if (trimmed) {
                              field.pushValue({ order: formBeats.length, description: trimmed });
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
                            field.pushValue({ order: formBeats.length, description: trimmed });
                            setBeatInput('');
                          }
                        }}
                        disabled={isUpdating}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {formBeats.length > 0 && (
                      <div className="space-y-2">
                        {formBeats.map((beat, index) => (
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
                              disabled={isUpdating}
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
                      isDisabled={isUpdating}
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
                                disabled={isUpdating}
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
                      isDisabled={isUpdating}
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
                                disabled={isUpdating}
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
                    disabled={isUpdating}
                  />
                )}
              </form.AppField>

              <form.AppField name="sound">
                {(field) => (
                  <field.TextareaField
                    label="Sound Design"
                    placeholder="Loud techno music..."
                    rows={2}
                    disabled={isUpdating}
                  />
                )}
              </form.AppField>

              <form.AppField name="camera">
                {(field) => (
                  <field.TextareaField
                    label="Camera"
                    placeholder="Wide shots, close-ups..."
                    rows={2}
                    disabled={isUpdating}
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
                  disabled={isUpdating}
                />
              )}
            </form.AppField>

            <form.AppField name="storyboardUrl">
              {(field) => (
                <field.TextField
                  label="Storyboard URL"
                  placeholder="https://example.com/storyboard.jpg"
                  disabled={isUpdating}
                />
              )}
            </form.AppField>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange?.(false)}
                submitLabel="Update Scene"
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

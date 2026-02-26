import { useCallback, useEffect, useRef, useState } from 'react';
import { LuArrowLeft, LuCheck, LuGripVertical, LuLoader, LuPlus, LuTrash2 } from 'react-icons/lu';
import z from 'zod';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { MultiSelect, SingleSelect } from '@~/components/ui/select';
import { Separator } from '@~/components/ui/separator';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

import { useUpdateScene } from '../hooks/mutations/use-update-scene';
import type { SceneDetailQueryReturnType } from '../hooks/queries/use-scene';
import { useSceneDetail } from '../hooks/queries/use-scene';

interface iSceneEditPanelProps {
  sceneId: string;
  seriesId: string;
  onClose: () => void;
}

interface iBeat {
  order: number;
  description: string;
}

const TIME_OF_DAY_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'DAY', label: 'Day' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'DAWN', label: 'Dawn' },
  { value: 'DUSK', label: 'Dusk' },
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'CONTINUOUS', label: 'Continuous' },
] as const;

// Outer component handles data loading
export function SceneEditPanel({ sceneId, seriesId, onClose }: iSceneEditPanelProps) {
  const { data: scene, isPending: isLoading, error } = useSceneDetail(sceneId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading scene...</p>
      </div>
    );
  }

  if (error || !scene) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Scene not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  // Render form only after data is loaded
  return <SceneEditForm scene={scene} seriesId={seriesId} onClose={onClose} />;
}

// Inner component that handles form logic - only mounted when scene is available
interface iSceneEditFormProps {
  scene: SceneDetailQueryReturnType;
  seriesId: string;
  onClose: () => void;
}

function SceneEditForm({ scene, seriesId, onClose }: iSceneEditFormProps) {
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

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  // State for array fields - initialize with scene data
  const [beats, setBeats] = useState<iBeat[]>(scene.beats ?? []);
  const [beatInput, setBeatInput] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(scene.characterIds ?? []);
  const [selectedPropIds, setSelectedPropIds] = useState<string[]>(scene.propIds ?? []);

  const form = useAppForm({
    defaultValues: {
      heading: scene.heading,
      locationId: scene.locationId ?? '',
      timeOfDay: scene.timeOfDay ?? '',
      duration: scene.duration ?? '',
      emotionalTone: scene.emotionalTone ?? '',
      conflict: scene.conflict ?? '',
      lighting: scene.lighting ?? '',
      sound: scene.sound ?? '',
      camera: scene.camera ?? '',
      storyNotes: scene.storyNotes ?? '',
      storyboardUrl: scene.storyboardUrl ?? '',
    },
    onSubmit: async ({ value }) => {
      const normalizedHeading = value.heading.trim();

      updateScene(
        {
          sceneId: scene._id,
          patch: {
            heading: normalizedHeading,
            locationId: value.locationId || undefined,
            timeOfDay: value.timeOfDay || undefined,
            duration: value.duration.trim() || undefined,
            emotionalTone: value.emotionalTone.trim() || undefined,
            conflict: value.conflict.trim() || undefined,
            lighting: value.lighting.trim() || undefined,
            sound: value.sound.trim() || undefined,
            camera: value.camera.trim() || undefined,
            storyNotes: value.storyNotes.trim() || undefined,
            storyboardUrl: value.storyboardUrl.trim() || undefined,
            beats: beats.length > 0 ? beats : undefined,
            characterIds: selectedCharacterIds.length > 0 ? selectedCharacterIds : undefined,
            propIds: selectedPropIds.length > 0 ? selectedPropIds : undefined,
          },
        },
        {
          onSuccess: () => {
            // Stay open on save, form is now synced
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        heading: z.string().trim().min(1, 'Heading is required').max(200, 'Heading must be 200 characters or less'),
        locationId: z.string(),
        timeOfDay: z.string(),
        duration: z.string().max(50, 'Duration must be 50 characters or less'),
        emotionalTone: z.string().max(100, 'Emotional tone must be 100 characters or less'),
        conflict: z.string().max(500, 'Conflict must be 500 characters or less'),
        lighting: z.string().max(200, 'Lighting must be 200 characters or less'),
        sound: z.string().max(200, 'Sound must be 200 characters or less'),
        camera: z.string().max(200, 'Camera must be 200 characters or less'),
        storyNotes: z.string().max(2000, 'Story notes must be 2000 characters or less'),
        storyboardUrl: z.string().refine((val) => val === '' || /^https?:\/\/.+/.test(val), 'Must be a valid URL'),
      }),
    },
  });

  // Auto-save function
  const handleAutoSave = useCallback(() => {
    if (!isInitializedRef.current) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');
    form.handleSubmit().catch(() => {
      // Handle submit errors silently - the form validators will show errors
    });
  }, [form]);

  // Mark as initialized after a short delay to avoid autosave on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitializedRef.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update save status when mutation completes
  useEffect(() => {
    if (!isUpdating && saveStatus === 'saving') {
      setSaveStatus('saved');
      // Clear saved status after 2 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isUpdating, saveStatus]);

  // Beat management
  const handleAddBeat = () => {
    if (beatInput.trim()) {
      const newBeats = [...beats, { order: beats.length, description: beatInput.trim() }];
      setBeats(newBeats);
      setBeatInput('');
      handleAutoSave();
    }
  };

  const handleRemoveBeat = (index: number) => {
    const updatedBeats = beats.filter((_, i) => i !== index);
    setBeats(updatedBeats.map((b, i) => ({ ...b, order: i })));
    handleAutoSave();
  };

  const handleMoveBeatUp = (index: number) => {
    if (index === 0) return;
    const newBeats = [...beats];
    [newBeats[index - 1], newBeats[index]] = [newBeats[index], newBeats[index - 1]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
    handleAutoSave();
  };

  const handleMoveBeatDown = (index: number) => {
    if (index === beats.length - 1) return;
    const newBeats = [...beats];
    [newBeats[index], newBeats[index + 1]] = [newBeats[index + 1], newBeats[index]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
    handleAutoSave();
  };

  // Get script title for display
  const script = scripts.find((s) => s._id === scene.scriptId);

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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Edit Scene</h2>
            <Badge variant="secondary" className="font-mono">
              #{scene.sceneNumber}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5">
              <LuLoader className="size-4 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600">
              <LuCheck className="size-4" />
              Saved
            </span>
          )}
          {saveStatus === 'idle' && <span>Auto-save enabled</span>}
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <form.AppForm key={scene._id}>
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
                {/* Heading - full width */}
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
                  {/* Location */}
                  <form.AppField name="locationId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="location-select">Location</Label>
                        <SingleSelect
                          id="location-select"
                          value={field.state.value ?? ''}
                          onValueChange={(value: string | null) => {
                            field.handleChange(value ?? '');
                            handleAutoSave();
                          }}
                          options={[
                            { value: '', label: 'None' },
                            ...locations.map((l) => ({ value: l._id, label: l.name })),
                          ]}
                          placeholder="Select location"
                        />
                      </div>
                    )}
                  </form.AppField>

                  {/* Time of Day */}
                  <form.AppField name="timeOfDay">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="time-of-day-select">Time of Day</Label>
                        <SingleSelect
                          id="time-of-day-select"
                          value={field.state.value ?? ''}
                          onValueChange={(value: string | null) => {
                            field.handleChange(value ?? '');
                            handleAutoSave();
                          }}
                          options={TIME_OF_DAY_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
                          placeholder="Select time"
                        />
                      </div>
                    )}
                  </form.AppField>

                  {/* Duration */}
                  <form.AppField name="duration">
                    {(field) => (
                      <field.TextField label="Duration" placeholder="e.g., 2 min 30 sec" onBlur={handleAutoSave} />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Story Elements Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Story Elements</CardTitle>
                <CardDescription>Narrative elements of this scene</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Emotional Tone */}
                  <form.AppField name="emotionalTone">
                    {(field) => (
                      <field.TextField
                        label="Emotional Tone"
                        placeholder="e.g., Tense, Romantic, Comedic"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  {/* Conflict */}
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

                {/* Story Notes - full width */}
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

            {/* Scene Beats Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Scene Beats</CardTitle>
                <CardDescription>Key story beats in sequential order ({beats.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Existing beats */}
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

                  {/* Add new beat */}
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

            {/* Characters & Props Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Characters & Props</CardTitle>
                <CardDescription>Who and what appears in this scene</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Characters */}
                  <div className="space-y-2">
                    <Label>Characters in Scene ({selectedCharacterIds.length})</Label>
                    <MultiSelect
                      options={characters.map((c) => ({ value: c._id, label: c.name }))}
                      value={selectedCharacterIds}
                      onValueChange={(values) => {
                        setSelectedCharacterIds(values);
                        handleAutoSave();
                      }}
                      placeholder="Select characters..."
                      closeMenuOnSelect={false}
                    />
                  </div>

                  {/* Props */}
                  <div className="space-y-2">
                    <Label>Props in Scene ({selectedPropIds.length})</Label>
                    <MultiSelect
                      options={props.map((p) => ({ value: p._id, label: p.name }))}
                      value={selectedPropIds}
                      onValueChange={(values) => {
                        setSelectedPropIds(values);
                        handleAutoSave();
                      }}
                      placeholder="Select props..."
                      closeMenuOnSelect={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Technical Details</CardTitle>
                <CardDescription>Production notes for this scene</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Lighting */}
                  <form.AppField name="lighting">
                    {(field) => (
                      <field.TextField label="Lighting" placeholder="e.g., Natural, Low-key" onBlur={handleAutoSave} />
                    )}
                  </form.AppField>

                  {/* Sound */}
                  <form.AppField name="sound">
                    {(field) => (
                      <field.TextField label="Sound" placeholder="e.g., Ambient city noise" onBlur={handleAutoSave} />
                    )}
                  </form.AppField>

                  {/* Camera */}
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

                {/* Storyboard URL */}
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
      </ScrollArea>
    </div>
  );
}

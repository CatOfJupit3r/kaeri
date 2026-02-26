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
import { SingleSelect } from '@~/components/ui/select';
import { Separator } from '@~/components/ui/separator';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { useThemeList } from '@~/features/themes/hooks/queries/use-theme-list';

import { useUpdateStoryArc } from '../hooks/mutations/use-update-story-arc';
import type { StoryArcDetailQueryReturnType } from '../hooks/queries/use-story-arc';
import { useStoryArc } from '../hooks/queries/use-story-arc';

interface iStoryArcEditPanelProps {
  storyArcId: string;
  seriesId: string;
  onClose: () => void;
}

interface iBeat {
  id: string;
  order: number;
  description: string;
  scriptId?: string;
  sceneId?: string;
}

interface iCharacterRole {
  characterId: string;
  role: string;
}

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
] as const;

const STATUS_COLORS = {
  planned: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  completed: 'bg-green-500/10 text-green-500 border-green-500/30',
  abandoned: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
} as const;

// Outer component handles data loading
export function StoryArcEditPanel({ storyArcId, seriesId, onClose }: iStoryArcEditPanelProps) {
  const { data: storyArc, isPending: isLoading, error } = useStoryArc(storyArcId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading story arc...</p>
      </div>
    );
  }

  if (error || !storyArc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Story arc not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  // Render form only after data is loaded
  return <StoryArcEditForm storyArc={storyArc} seriesId={seriesId} onClose={onClose} />;
}

// Inner component that handles form logic - only mounted when storyArc is available
interface iStoryArcEditFormProps {
  storyArc: StoryArcDetailQueryReturnType;
  seriesId: string;
  onClose: () => void;
}

function StoryArcEditForm({ storyArc, seriesId, onClose }: iStoryArcEditFormProps) {
  const { updateStoryArc, isPending: isUpdating } = useUpdateStoryArc();

  // Fetch data for dropdowns
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: themesData } = useThemeList(seriesId, 100, 0);

  const scripts = scriptsData?.items ?? [];
  const characters = charactersData?.items ?? [];
  const themes = themesData?.items ?? [];

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  // State for array fields - initialize with storyArc data
  const [beats, setBeats] = useState<iBeat[]>(storyArc.keyBeats ?? []);
  const [beatInput, setBeatInput] = useState('');
  const [characterRoles, setCharacterRoles] = useState<iCharacterRole[]>(storyArc.characters ?? []);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [characterRoleInput, setCharacterRoleInput] = useState('');
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>(storyArc.themeIds ?? []);

  const form = useAppForm({
    defaultValues: {
      name: storyArc.name,
      description: storyArc.description ?? '',
      status: storyArc.status,
      startScriptId: storyArc.startScriptId ?? '',
      endScriptId: storyArc.endScriptId ?? '',
      resolution: storyArc.resolution ?? '',
    },
    onSubmit: async ({ value }) => {
      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();
      const normalizedResolution = value.resolution.trim();

      updateStoryArc(
        {
          storyArcId: storyArc._id,
          patch: {
            name: normalizedName,
            description: normalizedDescription || undefined,
            status: value.status,
            startScriptId: value.startScriptId || undefined,
            endScriptId: value.endScriptId || undefined,
            keyBeats: beats.length > 0 ? beats : undefined,
            resolution: normalizedResolution || undefined,
            characters: characterRoles.length > 0 ? characterRoles : undefined,
            themeIds: selectedThemeIds.length > 0 ? selectedThemeIds : undefined,
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
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(1000, 'Description must be 1000 characters or less'),
        status: z.enum(['planned', 'in_progress', 'completed', 'abandoned']),
        startScriptId: z.string(),
        endScriptId: z.string(),
        resolution: z.string().trim().max(1000, 'Resolution must be 1000 characters or less'),
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
      const newBeats = [...beats, { id: crypto.randomUUID(), order: beats.length, description: beatInput.trim() }];
      setBeats(newBeats);
      setBeatInput('');
      handleAutoSave();
    }
  };

  const handleRemoveBeat = (id: string) => {
    const updatedBeats = beats.filter((b) => b.id !== id);
    setBeats(updatedBeats.map((b, index) => ({ ...b, order: index })));
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

  // Character management
  const handleAddCharacter = () => {
    if (selectedCharacterId && characterRoleInput.trim()) {
      if (!characterRoles.some((c) => c.characterId === selectedCharacterId)) {
        const newRoles = [...characterRoles, { characterId: selectedCharacterId, role: characterRoleInput.trim() }];
        setCharacterRoles(newRoles);
        setSelectedCharacterId('');
        setCharacterRoleInput('');
        handleAutoSave();
      }
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    setCharacterRoles(characterRoles.filter((c) => c.characterId !== characterId));
    handleAutoSave();
  };

  // Theme management
  const handleAddTheme = (themeId: string) => {
    if (themeId && !selectedThemeIds.includes(themeId)) {
      const newThemes = [...selectedThemeIds, themeId];
      setSelectedThemeIds(newThemes);
      handleAutoSave();
    }
  };

  const handleRemoveTheme = (themeId: string) => {
    setSelectedThemeIds(selectedThemeIds.filter((t) => t !== themeId));
    handleAutoSave();
  };

  const currentStatus = form.getFieldValue('status');

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
          <h2 className="text-lg font-bold">Edit Story Arc</h2>
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
        <form.AppForm key={storyArc._id}>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Core details about this story arc</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Name */}
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label="Arc Name"
                        placeholder="e.g., Hero's Journey"
                        required
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  {/* Status */}
                  <form.AppField name="status">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="status-select">Status</Label>
                        <SingleSelect
                          id="status-select"
                          value={field.state.value}
                          onValueChange={(value: string | null) => {
                            field.handleChange((value ?? 'planned') as typeof field.state.value);
                            handleAutoSave();
                          }}
                          options={STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                          placeholder="Select status"
                        />
                        <Badge variant="outline" className={STATUS_COLORS[field.state.value]}>
                          {STATUS_OPTIONS.find((opt) => opt.value === field.state.value)?.label}
                        </Badge>
                      </div>
                    )}
                  </form.AppField>
                </div>

                {/* Description - full width */}
                <div className="mt-4">
                  <form.AppField name="description">
                    {(field) => (
                      <field.TextareaField
                        label="Description"
                        placeholder="Describe the narrative arc's purpose, themes, and progression..."
                        rows={4}
                        maxLength={1000}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>

                {/* Script References */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="startScriptId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="start-script-select">Start Script</Label>
                        <SingleSelect
                          id="start-script-select"
                          value={field.state.value ?? ''}
                          onValueChange={(value: string | null) => {
                            field.handleChange(value ?? '');
                            handleAutoSave();
                          }}
                          options={[
                            { value: '', label: 'None' },
                            ...scripts.map((s) => ({ value: s._id, label: s.title })),
                          ]}
                          placeholder="Select start script"
                        />
                      </div>
                    )}
                  </form.AppField>

                  <form.AppField name="endScriptId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="end-script-select">End Script</Label>
                        <SingleSelect
                          id="end-script-select"
                          value={field.state.value ?? ''}
                          onValueChange={(value: string | null) => {
                            field.handleChange(value ?? '');
                            handleAutoSave();
                          }}
                          options={[
                            { value: '', label: 'None' },
                            ...scripts.map((s) => ({ value: s._id, label: s.title })),
                          ]}
                          placeholder="Select end script"
                        />
                      </div>
                    )}
                  </form.AppField>
                </div>

                {/* Resolution - only enabled when completed */}
                <div className="mt-4">
                  <form.AppField name="resolution">
                    {(field) => (
                      <field.TextareaField
                        label="Resolution"
                        placeholder="How does the arc conclude?"
                        rows={3}
                        maxLength={1000}
                        onBlur={handleAutoSave}
                        disabled={currentStatus !== 'completed'}
                        description={currentStatus === 'completed' ? '' : 'Only available when status is Completed'}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Three-column layout for Beats, Characters, and Themes */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Key Beats Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Key Beats</CardTitle>
                  <CardDescription>Important story moments ({beats.length})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {beats.length > 0 && (
                      <div className="space-y-2">
                        {beats.map((beat, index) => (
                          <div key={beat.id} className="flex items-center gap-2 rounded-md border p-2">
                            <div className="flex flex-col gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="size-5 p-0"
                                onClick={() => handleMoveBeatUp(index)}
                                disabled={index === 0 || isUpdating}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="size-5 p-0"
                                onClick={() => handleMoveBeatDown(index)}
                                disabled={index === beats.length - 1 || isUpdating}
                              >
                                ↓
                              </Button>
                            </div>
                            <LuGripVertical className="size-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1 truncate text-sm">{beat.description}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="size-6 shrink-0 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveBeat(beat.id)}
                              disabled={isUpdating}
                            >
                              <LuTrash2 className="size-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={beatInput}
                        onChange={(e) => setBeatInput(e.target.value)}
                        placeholder="Add a beat..."
                        disabled={isUpdating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBeat();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddBeat}
                        disabled={!beatInput.trim() || isUpdating}
                      >
                        <LuPlus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Characters Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Characters</CardTitle>
                  <CardDescription>Characters and their roles ({characterRoles.length})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {characterRoles.length > 0 && (
                      <div className="space-y-2">
                        {characterRoles.map((char) => {
                          const characterName =
                            characters.find((c) => c._id === char.characterId)?.name ?? char.characterId;
                          return (
                            <div key={char.characterId} className="flex items-center gap-2 rounded-md border p-2">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{characterName}</p>
                                <p className="truncate text-xs text-muted-foreground">{char.role}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="size-6 shrink-0 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveCharacter(char.characterId)}
                                disabled={isUpdating}
                              >
                                <LuTrash2 className="size-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="space-y-2">
                      <SingleSelect
                        value={selectedCharacterId}
                        onValueChange={(value: string | null) => setSelectedCharacterId(value ?? '')}
                        options={characters
                          .filter((c) => !characterRoles.some((cr) => cr.characterId === c._id))
                          .map((c) => ({ value: c._id, label: c.name }))}
                        placeholder="Select character"
                        isDisabled={isUpdating}
                      />
                      <Input
                        value={characterRoleInput}
                        onChange={(e) => setCharacterRoleInput(e.target.value)}
                        placeholder="Role (e.g., protagonist)"
                        disabled={isUpdating}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCharacter}
                        disabled={!selectedCharacterId || !characterRoleInput.trim() || isUpdating}
                        className="w-full"
                      >
                        Add Character
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Themes Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Themes</CardTitle>
                  <CardDescription>Associated themes ({selectedThemeIds.length})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedThemeIds.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedThemeIds.map((themeId) => {
                          const themeName = themes.find((t) => t._id === themeId)?.name ?? themeId;
                          return (
                            <Badge key={themeId} variant="secondary" className="gap-1 pr-1">
                              <span className="max-w-24 truncate">{themeName}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="size-4 p-0 hover:bg-transparent"
                                onClick={() => handleRemoveTheme(themeId)}
                                disabled={isUpdating}
                              >
                                <LuTrash2 className="size-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    <SingleSelect
                      value=""
                      onValueChange={(value: string | null) => {
                        if (value) handleAddTheme(value);
                      }}
                      options={themes
                        .filter((t) => !selectedThemeIds.includes(t._id))
                        .map((t) => ({ value: t._id, label: t.name }))}
                      placeholder="Add theme"
                      isDisabled={isUpdating}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </form.Form>
        </form.AppForm>
      </ScrollArea>
    </div>
  );
}

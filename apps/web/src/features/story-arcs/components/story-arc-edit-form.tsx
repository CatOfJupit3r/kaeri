import { useState } from 'react';
import { LuGripVertical, LuPlus, LuTrash2 } from 'react-icons/lu';

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
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { useThemeList } from '@~/features/themes/hooks/queries/use-theme-list';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateStoryArc } from '../hooks/mutations/use-update-story-arc';
import type { StoryArcDetailQueryReturnType } from '../hooks/queries/use-story-arc';
import { storyArcFormSchema } from '../schemas/story-arc.schema';

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

interface iStoryArcEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: StoryArcDetailQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Unified edit form for story arcs.
 * Supports both panel mode (auto-save on blur) and dialog mode (manual submit).
 *
 * @param mode - 'panel' for inline panel editing, 'dialog' for modal editing
 * @param initialData - Required story arc data (parent fetches this)
 */
export function StoryArcEditForm({ mode, seriesId, initialData, onClose, open, onOpenChange }: iStoryArcEditFormProps) {
  const { updateStoryArc, isPending: isUpdating } = useUpdateStoryArc();

  // Fetch data for dropdowns
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: themesData } = useThemeList(seriesId, 100, 0);

  const scripts = scriptsData?.items ?? [];
  const characters = charactersData?.items ?? [];
  const themes = themesData?.items ?? [];

  // Local state for array fields
  const [beats, setBeats] = useState<iBeat[]>(initialData.keyBeats ?? []);
  const [beatInput, setBeatInput] = useState('');
  const [characterRoles, setCharacterRoles] = useState<iCharacterRole[]>(initialData.characters ?? []);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [characterRoleInput, setCharacterRoleInput] = useState('');
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>(initialData.themeIds ?? []);

  const form = useAppForm({
    defaultValues: {
      name: initialData.name,
      description: initialData.description ?? '',
      status: initialData.status,
      startScriptId: initialData.startScriptId ?? '',
      endScriptId: initialData.endScriptId ?? '',
      resolution: initialData.resolution ?? '',
    },
    onSubmit: async ({ value }) => {
      updateStoryArc(
        {
          storyArcId: initialData._id,
          patch: {
            name: value.name || undefined,
            description: value.description || undefined,
            status: value.status,
            startScriptId: value.startScriptId || undefined,
            endScriptId: value.endScriptId || undefined,
            keyBeats: beats.length > 0 ? beats : undefined,
            resolution: value.resolution || undefined,
            characters: characterRoles.length > 0 ? characterRoles : undefined,
            themeIds: selectedThemeIds.length > 0 ? selectedThemeIds : undefined,
          },
        },
        {
          onSuccess: () => {
            if (mode === EDIT_FORM_MODES.dialog) {
              onOpenChange?.(false);
            }
          },
        },
      );
    },
    validators: {
      onSubmit: storyArcFormSchema,
    },
  });

  const { handleAutoSave } = useAutoSave(form, {
    isUpdating,
    enabled: mode === EDIT_FORM_MODES.panel,
  });

  // Beat management
  const handleAddBeat = () => {
    if (beatInput.trim()) {
      const newBeats = [...beats, { id: crypto.randomUUID(), order: beats.length, description: beatInput.trim() }];
      setBeats(newBeats);
      setBeatInput('');
      if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
    }
  };

  const handleRemoveBeat = (id: string) => {
    const updatedBeats = beats.filter((b) => b.id !== id);
    setBeats(updatedBeats.map((b, index) => ({ ...b, order: index })));
    if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
  };

  const handleMoveBeatUp = (index: number) => {
    if (index === 0) return;
    const newBeats = [...beats];
    [newBeats[index - 1], newBeats[index]] = [newBeats[index], newBeats[index - 1]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
    if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
  };

  const handleMoveBeatDown = (index: number) => {
    if (index === beats.length - 1) return;
    const newBeats = [...beats];
    [newBeats[index], newBeats[index + 1]] = [newBeats[index + 1], newBeats[index]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
    if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
  };

  // Character management
  const handleAddCharacter = () => {
    if (selectedCharacterId && characterRoleInput.trim()) {
      if (!characterRoles.some((c) => c.characterId === selectedCharacterId)) {
        const newRoles = [...characterRoles, { characterId: selectedCharacterId, role: characterRoleInput.trim() }];
        setCharacterRoles(newRoles);
        setSelectedCharacterId('');
        setCharacterRoleInput('');
        if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
      }
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    setCharacterRoles(characterRoles.filter((c) => c.characterId !== characterId));
    if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
  };

  // Theme management
  const handleAddTheme = (themeId: string) => {
    if (themeId && !selectedThemeIds.includes(themeId)) {
      const newThemes = [...selectedThemeIds, themeId];
      setSelectedThemeIds(newThemes);
      if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
    }
  };

  const handleRemoveTheme = (themeId: string) => {
    setSelectedThemeIds(selectedThemeIds.filter((t) => t !== themeId));
    if (mode === EDIT_FORM_MODES.panel) handleAutoSave();
  };

  const handleBlur = mode === EDIT_FORM_MODES.panel ? handleAutoSave : undefined;
  const currentStatus = form.getFieldValue('status');

  // Panel form content
  const panelFormContent = (
    <form.AppForm key={initialData._id}>
      <form.Form className="p-4">
        {/* Basic Info Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>Core details about this story arc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField label="Arc Name" placeholder="e.g., Hero's Journey" required onBlur={handleBlur} />
                )}
              </form.AppField>

              <form.AppField name="status">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="status-select">Status</Label>
                    <SingleSelect
                      id="status-select"
                      value={field.state.value}
                      onValueChange={(value: string | null) => {
                        field.handleChange((value ?? 'planned') as typeof field.state.value);
                        if (handleBlur) handleBlur();
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

            <div className="mt-4">
              <form.AppField name="description">
                {(field) => (
                  <field.TextareaField
                    label="Description"
                    placeholder="Describe the narrative arc..."
                    rows={4}
                    maxLength={1000}
                    onBlur={handleBlur}
                  />
                )}
              </form.AppField>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.AppField name="startScriptId">
                {(field) => (
                  <field.SelectField
                    label="Start Script"
                    options={[{ value: '', label: 'None' }, ...scripts.map((s) => ({ value: s._id, label: s.title }))]}
                    placeholder="Select start script"
                    onBlur={handleBlur}
                  />
                )}
              </form.AppField>

              <form.AppField name="endScriptId">
                {(field) => (
                  <field.SelectField
                    label="End Script"
                    options={[{ value: '', label: 'None' }, ...scripts.map((s) => ({ value: s._id, label: s.title }))]}
                    placeholder="Select end script"
                    onBlur={handleBlur}
                  />
                )}
              </form.AppField>
            </div>

            <div className="mt-4">
              <form.AppField name="resolution">
                {(field) => (
                  <field.TextareaField
                    label="Resolution"
                    placeholder="How does the arc conclude?"
                    rows={3}
                    maxLength={1000}
                    onBlur={handleBlur}
                    disabled={currentStatus !== 'completed'}
                    description={currentStatus === 'completed' ? undefined : 'Only available when status is Completed'}
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
  );

  // Dialog form content (simpler layout)
  const dialogFormContent = (
    <form.AppForm>
      <form.Form className="space-y-4 p-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <form.AppField name="name">
            {(field) => <field.TextField label="Arc Name" placeholder="Enter arc name" required />}
          </form.AppField>

          <form.AppField name="status">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="status-dialog">Status</Label>
                <SingleSelect
                  id="status-dialog"
                  value={field.state.value}
                  onValueChange={(value: string | null) =>
                    field.handleChange((value ?? 'planned') as typeof field.state.value)
                  }
                  options={STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  placeholder="Select status"
                />
              </div>
            )}
          </form.AppField>
        </div>

        <form.AppField name="description">
          {(field) => <field.TextareaField label="Description" placeholder="Describe the narrative arc..." rows={3} />}
        </form.AppField>

        <DialogFooter>
          <form.FormActions
            onCancel={() => onOpenChange?.(false)}
            submitLabel="Update Story Arc"
            loadingLabel="Updating..."
            isDisabled={isUpdating}
          />
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );

  // Render based on mode
  if (mode === EDIT_FORM_MODES.panel) {
    return (
      <EditPanelWrapper title="Edit Story Arc" onClose={onClose}>
        {panelFormContent}
      </EditPanelWrapper>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Story Arc</DialogTitle>
          <DialogDescription>Update the story arc details below.</DialogDescription>
        </DialogHeader>
        {dialogFormContent}
      </DialogContent>
    </Dialog>
  );
}

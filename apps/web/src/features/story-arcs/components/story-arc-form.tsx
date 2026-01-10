import { useCallback, useState } from 'react';
import { LuGripVertical, LuPlus, LuTrash2 } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { SingleSelect } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { useThemeList } from '@~/features/themes/hooks/queries/use-theme-list';

import { useCreateStoryArc } from '../hooks/mutations/use-create-story-arc';
import { useUpdateStoryArc } from '../hooks/mutations/use-update-story-arc';
import type { StoryArcListItem } from '../hooks/queries/use-story-arc-list';

interface iStoryArcFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: StoryArcListItem;
}

interface iBeat {
  id: string;
  order: number;
  description: string;
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

export function StoryArcForm({ seriesId, open, onOpenChange, initialData }: iStoryArcFormProps) {
  const isEditMode = !!initialData;
  const { createStoryArc, isPending: isCreating } = useCreateStoryArc();
  const { updateStoryArc, isPending: isUpdating } = useUpdateStoryArc();
  const isPending = isCreating || isUpdating;

  // Fetch data for dropdowns
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: themesData } = useThemeList(seriesId, 100, 0);

  const scripts = scriptsData?.items ?? [];
  const characters = charactersData?.items ?? [];
  const themes = themesData?.items ?? [];

  const [beats, setBeats] = useState<iBeat[]>(
    initialData?.keyBeats ?? [{ id: crypto.randomUUID(), order: 0, description: '' }],
  );
  const [beatInput, setBeatInput] = useState('');
  const [characterRoles, setCharacterRoles] = useState<iCharacterRole[]>(initialData?.characters ?? []);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [characterRoleInput, setCharacterRoleInput] = useState('');
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>(initialData?.themeIds ?? []);

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? ('planned' as const),
      startScriptId: initialData?.startScriptId ?? '',
      endScriptId: initialData?.endScriptId ?? '',
      resolution: initialData?.resolution ?? '',
    },
    onSubmit: async ({ value }) => {
      const payload = {
        seriesId,
        name: value.name,
        description: value.description,
        status: value.status,
        startScriptId: value.startScriptId || undefined,
        endScriptId: value.endScriptId || undefined,
        keyBeats: beats,
        resolution: value.resolution || undefined,
        characters: characterRoles,
        themeIds: selectedThemeIds,
      };

      const handleSuccess = () => {
        onOpenChange(false);
        form.reset();
        setBeats([{ id: crypto.randomUUID(), order: 0, description: '' }]);
        setCharacterRoles([]);
        setSelectedThemeIds([]);
        setBeatInput('');
        setSelectedCharacterId('');
        setCharacterRoleInput('');
      };

      if (isEditMode && initialData) {
        updateStoryArc(
          {
            storyArcId: initialData._id,
            patch: {
              name: value.name,
              description: value.description,
              status: value.status,
              startScriptId: value.startScriptId || undefined,
              endScriptId: value.endScriptId || undefined,
              keyBeats: beats,
              resolution: value.resolution || undefined,
              characters: characterRoles,
              themeIds: selectedThemeIds,
            },
          },
          { onSuccess: handleSuccess },
        );
      } else {
        createStoryArc(payload, { onSuccess: handleSuccess });
      }
    },
  });

  const resetForm = useCallback(() => {
    form.reset();
    setBeats([{ id: crypto.randomUUID(), order: 0, description: '' }]);
    setCharacterRoles([]);
    setSelectedThemeIds([]);
    setBeatInput('');
    setSelectedCharacterId('');
    setCharacterRoleInput('');
  }, [form]);

  const handleAddBeat = () => {
    if (beatInput.trim()) {
      setBeats([...beats, { id: crypto.randomUUID(), order: beats.length, description: beatInput.trim() }]);
      setBeatInput('');
    }
  };

  const handleRemoveBeat = (id: string) => {
    const updatedBeats = beats.filter((b) => b.id !== id);
    setBeats(updatedBeats.map((b, index) => ({ ...b, order: index })));
  };

  const handleMoveBeatUp = (index: number) => {
    if (index === 0) return;
    const newBeats = [...beats];
    [newBeats[index - 1], newBeats[index]] = [newBeats[index], newBeats[index - 1]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
  };

  const handleMoveBeatDown = (index: number) => {
    if (index === beats.length - 1) return;
    const newBeats = [...beats];
    [newBeats[index], newBeats[index + 1]] = [newBeats[index + 1], newBeats[index]];
    setBeats(newBeats.map((b, i) => ({ ...b, order: i })));
  };

  const handleAddCharacter = () => {
    if (selectedCharacterId && characterRoleInput.trim()) {
      // Avoid duplicates
      if (!characterRoles.find((c) => c.characterId === selectedCharacterId)) {
        setCharacterRoles([...characterRoles, { characterId: selectedCharacterId, role: characterRoleInput.trim() }]);
        setSelectedCharacterId('');
        setCharacterRoleInput('');
      }
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    setCharacterRoles(characterRoles.filter((c) => c.characterId !== characterId));
  };

  const handleAddTheme = (themeId: string) => {
    if (themeId && !selectedThemeIds.includes(themeId)) {
      setSelectedThemeIds([...selectedThemeIds, themeId]);
    }
  };

  const handleRemoveTheme = (themeId: string) => {
    setSelectedThemeIds(selectedThemeIds.filter((t) => t !== themeId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Story Arc' : 'Create Story Arc'}</DialogTitle>
        </DialogHeader>

        <form.AppForm>
          <form.Form
            className="space-y-4 p-0"
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.AppField name="name">
              {(field) => <field.TextField label="Arc Name" placeholder="e.g., Hero's Journey" required />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.TextareaField label="Description" placeholder="Describe the narrative arc..." rows={4} />
              )}
            </form.AppField>

            <form.AppField name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="status-select">Status</Label>
                  <SingleSelect
                    id="status-select"
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

            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="startScriptId">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="start-script-select">Start Script</Label>
                    <SingleSelect
                      id="start-script-select"
                      value={field.state.value ?? ''}
                      onValueChange={(value: string | null) => field.handleChange(value ?? '')}
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
                      onValueChange={(value: string | null) => field.handleChange(value ?? '')}
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

            {/* Key Beats */}
            <div className="space-y-2">
              <Label htmlFor="beats-input">Key Beats</Label>
              <div className="space-y-2">
                {beats.map((beat, index) => (
                  <div key={beat.id} className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-6 p-0"
                        onClick={() => handleMoveBeatUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-6 p-0"
                        onClick={() => handleMoveBeatDown(index)}
                        disabled={index === beats.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                    <LuGripVertical className="size-4 text-muted-foreground" />
                    <Input value={beat.description} readOnly className="flex-1" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBeat(beat.id)}>
                      <LuTrash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="beats-input"
                  value={beatInput}
                  onChange={(e) => setBeatInput(e.target.value)}
                  placeholder="Add a beat..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBeat();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddBeat}>
                  <LuPlus className="size-4" />
                </Button>
              </div>
            </div>

            {/* Characters */}
            <div className="space-y-2">
              <Label htmlFor="character-select">Characters</Label>
              <div className="space-y-2">
                {characterRoles.map((char) => {
                  const characterName = characters.find((c) => c._id === char.characterId)?.name ?? char.characterId;
                  return (
                    <div key={char.characterId} className="flex items-center gap-2 rounded-lg border p-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{characterName}</p>
                        <p className="text-xs text-muted-foreground">{char.role}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCharacter(char.characterId)}
                      >
                        <LuTrash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SingleSelect
                  id="character-select"
                  value={selectedCharacterId}
                  onValueChange={(value: string | null) => setSelectedCharacterId(value ?? '')}
                  options={characters
                    .filter((c) => !characterRoles.find((cr) => cr.characterId === c._id))
                    .map((c) => ({ value: c._id, label: c.name }))}
                  placeholder="Select character"
                />
                <Input
                  value={characterRoleInput}
                  onChange={(e) => setCharacterRoleInput(e.target.value)}
                  placeholder="Role (e.g., protagonist)"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddCharacter} className="w-full">
                Add Character
              </Button>
            </div>

            {/* Themes */}
            <div className="space-y-2">
              <Label htmlFor="theme-select">Themes</Label>
              <div className="flex flex-wrap gap-2">
                {selectedThemeIds.map((themeId) => {
                  const themeName = themes.find((t) => t._id === themeId)?.name ?? themeId;
                  return (
                    <div key={themeId} className="flex items-center gap-1 rounded-md border px-2 py-1">
                      <span className="text-sm">{themeName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-5 p-0"
                        onClick={() => handleRemoveTheme(themeId)}
                      >
                        <LuTrash2 className="size-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <SingleSelect
                id="theme-select"
                value=""
                onValueChange={(value: string | null) => {
                  if (value) handleAddTheme(value);
                }}
                options={themes
                  .filter((t) => !selectedThemeIds.includes(t._id))
                  .map((t) => ({ value: t._id, label: t.name }))}
                placeholder="Add theme"
              />
            </div>

            <form.AppField name="resolution">
              {(field) => (
                <field.TextareaField
                  label="Resolution"
                  placeholder="How does the arc conclude?"
                  rows={3}
                  disabled={form.getFieldValue('status') !== 'completed'}
                />
              )}
            </form.AppField>

            <DialogFooter>
              <form.FormActions
                onCancel={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                submitLabel={isEditMode ? 'Update' : 'Create'}
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

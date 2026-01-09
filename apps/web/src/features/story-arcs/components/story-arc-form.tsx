import { useCallback, useState } from 'react';
import { LuGripVertical, LuPlus, LuTrash2 } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { SingleSelect } from '@~/components/ui/select';

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

  const [beats, setBeats] = useState<iBeat[]>(
    initialData?.keyBeats ?? [{ id: crypto.randomUUID(), order: 0, description: '' }],
  );
  const [beatInput, setBeatInput] = useState('');
  const [characters, setCharacters] = useState<iCharacterRole[]>(initialData?.characters ?? []);
  const [characterIdInput, setCharacterIdInput] = useState('');
  const [characterRoleInput, setCharacterRoleInput] = useState('');
  const [themeInput, setThemeInput] = useState('');
  const [themes, setThemes] = useState<string[]>(initialData?.themeIds ?? []);

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
        characters,
        themeIds: themes,
      };

      const handleSuccess = () => {
        onOpenChange(false);
        form.reset();
        setBeats([{ id: crypto.randomUUID(), order: 0, description: '' }]);
        setCharacters([]);
        setThemes([]);
        setBeatInput('');
        setCharacterIdInput('');
        setCharacterRoleInput('');
        setThemeInput('');
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
              characters,
              themeIds: themes,
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
    setCharacters([]);
    setThemes([]);
    setBeatInput('');
    setCharacterIdInput('');
    setCharacterRoleInput('');
    setThemeInput('');
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
    if (characterIdInput.trim() && characterRoleInput.trim()) {
      setCharacters([...characters, { characterId: characterIdInput.trim(), role: characterRoleInput.trim() }]);
      setCharacterIdInput('');
      setCharacterRoleInput('');
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    setCharacters(characters.filter((c) => c.characterId !== characterId));
  };

  const handleAddTheme = () => {
    if (themeInput.trim() && !themes.includes(themeInput.trim())) {
      setThemes([...themes, themeInput.trim()]);
      setThemeInput('');
    }
  };

  const handleRemoveTheme = (themeId: string) => {
    setThemes(themes.filter((t) => t !== themeId));
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
                {(field) => <field.TextField label="Start Script ID" placeholder="Optional" />}
              </form.AppField>

              <form.AppField name="endScriptId">
                {(field) => <field.TextField label="End Script ID" placeholder="Optional" />}
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
              <Label htmlFor="character-id-input">Characters</Label>
              <div className="space-y-2">
                {characters.map((char) => (
                  <div key={char.characterId} className="flex items-center gap-2 rounded-lg border p-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{char.characterId}</p>
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
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="character-id-input"
                  value={characterIdInput}
                  onChange={(e) => setCharacterIdInput(e.target.value)}
                  placeholder="Character ID"
                />
                <Input
                  value={characterRoleInput}
                  onChange={(e) => setCharacterRoleInput(e.target.value)}
                  placeholder="Role"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddCharacter} className="w-full">
                Add Character
              </Button>
            </div>

            {/* Themes */}
            <div className="space-y-2">
              <Label htmlFor="theme-input">Themes</Label>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <div key={theme} className="flex items-center gap-1 rounded-md border px-2 py-1">
                    <span className="text-sm">{theme}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-5 p-0"
                      onClick={() => handleRemoveTheme(theme)}
                    >
                      <LuTrash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder="Add theme ID..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTheme();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTheme}>
                  <LuPlus className="size-4" />
                </Button>
              </div>
            </div>

            <form.AppField name="resolution">
              {(field) => <field.TextareaField label="Resolution" placeholder="How does the arc conclude?" rows={3} />}
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

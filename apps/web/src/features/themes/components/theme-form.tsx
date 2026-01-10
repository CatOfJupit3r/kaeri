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

import { useCreateTheme } from '../hooks/mutations/use-create-theme';
import { useUpdateTheme } from '../hooks/mutations/use-update-theme';
import type { ThemeListItem } from '../hooks/queries/use-theme-list';

type CharacterConnection = NonNullable<ThemeListItem['relatedCharacters']>[number];
type EvolutionEntry = NonNullable<ThemeListItem['evolution']>[number];
type Appearance = NonNullable<ThemeListItem['appearances']>[number];

interface iThemeFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ThemeListItem;
}

const COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
];

export function ThemeForm({ seriesId, open, onOpenChange, initialData }: iThemeFormProps) {
  const { createTheme, isPending: isCreating } = useCreateTheme();
  const { updateTheme, isPending: isUpdating } = useUpdateTheme();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  // Local state for complex fields
  const [characterConnections, setCharacterConnections] = useState<CharacterConnection[]>(
    initialData?.relatedCharacters ?? [],
  );
  const [evolutionEntries, setEvolutionEntries] = useState<EvolutionEntry[]>(initialData?.evolution ?? []);
  const [appearances, setAppearances] = useState<Appearance[]>(initialData?.appearances ?? []);

  // State for adding new items
  const [newCharacterId, setNewCharacterId] = useState('');
  const [newConnection, setNewConnection] = useState('');
  const [newScriptId, setNewScriptId] = useState('');
  const [newEvolutionNotes, setNewEvolutionNotes] = useState('');
  const [newSceneRef, setNewSceneRef] = useState('');
  const [newQuote, setNewQuote] = useState('');

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      color: initialData?.color ?? '',
      visualMotifs: initialData?.visualMotifs ?? ([] as string[]),
    },
    onSubmit: async ({ value }) => {
      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();

      if (isEditMode && initialData) {
        updateTheme(
          {
            themeId: initialData._id,
            patch: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              color: value.color || undefined,
              visualMotifs: value.visualMotifs.length > 0 ? value.visualMotifs : undefined,
              relatedCharacters: characterConnections.length > 0 ? characterConnections : undefined,
              evolution: evolutionEntries.length > 0 ? evolutionEntries : undefined,
              appearances: appearances.length > 0 ? appearances : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createTheme(
          {
            seriesId,
            value: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              color: value.color || undefined,
              visualMotifs: value.visualMotifs.length > 0 ? value.visualMotifs : undefined,
              relatedCharacters: characterConnections.length > 0 ? characterConnections : undefined,
              evolution: evolutionEntries.length > 0 ? evolutionEntries : undefined,
              appearances: appearances.length > 0 ? appearances : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
              setCharacterConnections([]);
              setEvolutionEntries([]);
              setAppearances([]);
            },
          },
        );
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(1000, 'Description must be 1000 characters or less'),
        color: z.string().trim(),
        visualMotifs: z.array(z.string()),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        color: initialData.color ?? '',
        visualMotifs: initialData.visualMotifs ?? [],
      });
      setCharacterConnections(initialData.relatedCharacters ?? []);
      setEvolutionEntries(initialData.evolution ?? []);
      setAppearances(initialData.appearances ?? []);
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
        color: '',
        visualMotifs: [],
      });
      setCharacterConnections([]);
      setEvolutionEntries([]);
      setAppearances([]);
      setNewCharacterId('');
      setNewConnection('');
      setNewScriptId('');
      setNewEvolutionNotes('');
      setNewSceneRef('');
      setNewQuote('');
    }
  }, [open, initialData, form]);

  const handleAddCharacterConnection = () => {
    if (newCharacterId.trim() && newConnection.trim()) {
      setCharacterConnections([
        ...characterConnections,
        {
          characterId: newCharacterId.trim(),
          connection: newConnection.trim(),
        },
      ]);
      setNewCharacterId('');
      setNewConnection('');
    }
  };

  const handleRemoveCharacterConnection = (index: number) => {
    setCharacterConnections(characterConnections.filter((_, i) => i !== index));
  };

  const handleAddEvolutionEntry = () => {
    if (newScriptId.trim() && newEvolutionNotes.trim()) {
      setEvolutionEntries([
        ...evolutionEntries,
        {
          scriptId: newScriptId.trim(),
          notes: newEvolutionNotes.trim(),
        },
      ]);
      setNewScriptId('');
      setNewEvolutionNotes('');
    }
  };

  const handleRemoveEvolutionEntry = (index: number) => {
    setEvolutionEntries(evolutionEntries.filter((_, i) => i !== index));
  };

  const handleAddAppearance = () => {
    if (newScriptId.trim() && newSceneRef.trim()) {
      setAppearances([
        ...appearances,
        {
          scriptId: newScriptId.trim(),
          sceneRef: newSceneRef.trim(),
          quote: newQuote.trim() || undefined,
        },
      ]);
      setNewScriptId('');
      setNewSceneRef('');
      setNewQuote('');
    }
  };

  const handleRemoveAppearance = (index: number) => {
    setAppearances(appearances.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Theme' : 'Create Theme'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the theme details below.'
              : 'Add a new theme to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="name">
                {(field) => <field.TextField label="Name" placeholder="Enter theme name" required />}
              </form.AppField>

              <form.AppField name="color">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <SingleSelect
                      id="color"
                      options={COLOR_OPTIONS}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      placeholder="Select a color"
                      isDisabled={isPending}
                    />
                  </div>
                )}
              </form.AppField>
            </div>

            <form.AppField name="description">
              {(field) => (
                <field.TextareaField
                  label="Description"
                  placeholder="Describe the theme..."
                  rows={4}
                  maxLength={1000}
                />
              )}
            </form.AppField>

            {/* Visual Motifs */}
            <form.Field name="visualMotifs" mode="array">
              {(field) => {
                const motifs = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="motifs">Visual Motifs</Label>
                    <div className="flex gap-2">
                      <Input
                        id="motifs"
                        placeholder="Add a visual motif (press Enter)"
                        disabled={isPending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const trimmedMotif = input.value.trim();
                            if (trimmedMotif && !motifs.includes(trimmedMotif)) {
                              field.pushValue(trimmedMotif);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('motifs') as HTMLInputElement;
                          if (input) {
                            const trimmedMotif = input.value.trim();
                            if (trimmedMotif && !motifs.includes(trimmedMotif)) {
                              field.pushValue(trimmedMotif);
                              input.value = '';
                            }
                          }
                        }}
                        disabled={isPending}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {motifs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {motifs.map((motif, index) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <Badge key={`${motif}-${index}`} variant="secondary" className="gap-1">
                            {motif}
                            <button
                              type="button"
                              onClick={() => field.removeValue(index)}
                              className="ml-1 rounded-full hover:bg-muted"
                              disabled={isPending}
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

            {/* Character Connections */}
            <div className="space-y-2">
              <Label htmlFor="character-connections">Character Connections</Label>
              <div id="character-connections" className="space-y-2 rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Character ID"
                    value={newCharacterId}
                    onChange={(e) => setNewCharacterId(e.target.value)}
                    disabled={isPending}
                  />
                  <Input
                    placeholder="Connection description"
                    value={newConnection}
                    onChange={(e) => setNewConnection(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddCharacterConnection}
                  disabled={isPending || !newCharacterId.trim() || !newConnection.trim()}
                  size="sm"
                  className="w-full"
                >
                  Add Connection
                </Button>
              </div>
              {characterConnections.length > 0 ? (
                <div className="space-y-2">
                  {characterConnections.map((conn, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className="flex items-start gap-2 rounded-md border p-2">
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{conn.characterId}:</span> {conn.connection}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCharacterConnection(index)}
                        className="rounded-full hover:bg-muted"
                        disabled={isPending}
                      >
                        <LuX className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Evolution Entries */}
            <div className="space-y-2">
              <Label htmlFor="evolution-entries">Thematic Evolution</Label>
              <div id="evolution-entries" className="space-y-2 rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Script ID"
                    value={newScriptId}
                    onChange={(e) => setNewScriptId(e.target.value)}
                    disabled={isPending}
                  />
                  <Input
                    placeholder="Evolution notes"
                    value={newEvolutionNotes}
                    onChange={(e) => setNewEvolutionNotes(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddEvolutionEntry}
                  disabled={isPending || !newScriptId.trim() || !newEvolutionNotes.trim()}
                  size="sm"
                  className="w-full"
                >
                  Add Evolution Entry
                </Button>
              </div>
              {evolutionEntries.length > 0 ? (
                <div className="space-y-2">
                  {evolutionEntries.map((entry, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className="flex items-start gap-2 rounded-md border p-2">
                      <div className="flex-1 text-sm">
                        <span className="font-medium">Script {entry.scriptId}:</span> {entry.notes}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvolutionEntry(index)}
                        className="rounded-full hover:bg-muted"
                        disabled={isPending}
                      >
                        <LuX className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Appearances */}
            <div className="space-y-2">
              <Label htmlFor="appearances-in-scripts">Appearances in Scripts</Label>
              <div id="appearances-in-scripts" className="space-y-2 rounded-lg border p-3">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Script ID"
                    value={newScriptId}
                    onChange={(e) => setNewScriptId(e.target.value)}
                    disabled={isPending}
                  />
                  <Input
                    placeholder="Scene Ref"
                    value={newSceneRef}
                    onChange={(e) => setNewSceneRef(e.target.value)}
                    disabled={isPending}
                  />
                  <Input
                    placeholder="Quote (optional)"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddAppearance}
                  disabled={isPending || !newScriptId.trim() || !newSceneRef.trim()}
                  size="sm"
                  className="w-full"
                >
                  Add Appearance
                </Button>
              </div>
              {appearances.length > 0 ? (
                <div className="space-y-2">
                  {appearances.map((app, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className="flex items-start gap-2 rounded-md border p-2">
                      <div className="flex-1 text-sm">
                        <span className="font-medium">
                          Script {app.scriptId}, Scene {app.sceneRef}
                        </span>
                        {app.quote ? (
                          <span className="ml-2 text-muted-foreground italic">&quot;{app.quote}&quot;</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAppearance(index)}
                        className="rounded-full hover:bg-muted"
                        disabled={isPending}
                      >
                        <LuX className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel={isEditMode ? 'Update Theme' : 'Create Theme'}
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

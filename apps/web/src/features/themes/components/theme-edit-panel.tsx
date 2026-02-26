import { useState } from 'react';
import { LuArrowLeft, LuPalette, LuPlus, LuTrash2 } from 'react-icons/lu';

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
import { useAutoSave } from '@~/hooks/use-auto-save';

import { useUpdateTheme } from '../hooks/mutations/use-update-theme';
import type { ThemeDetailQueryReturnType } from '../hooks/queries/use-theme';
import { useThemeDetail } from '../hooks/queries/use-theme';
import { themeEditSchema } from '../schemas/theme.schema';

interface iThemeEditPanelProps {
  themeId: string;
  seriesId: string;
  onClose: () => void;
}

interface iCharacterConnection {
  characterId: string;
  connection: string;
}

interface iThemeEvolution {
  scriptId: string;
  notes: string;
}

// Preset colors for easy selection
const PRESET_COLORS = [
  { value: '#EF4444', label: 'Red' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EAB308', label: 'Yellow' },
  { value: '#22C55E', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#A855F7', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
] as const;

// Outer component handles data loading
export function ThemeEditPanel({ themeId, seriesId, onClose }: iThemeEditPanelProps) {
  const { data: theme, isPending: isLoading, error } = useThemeDetail(themeId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading theme...</p>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Theme not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  // Render form only after data is loaded
  return <ThemeEditForm theme={theme} seriesId={seriesId} onClose={onClose} />;
}

// Inner component that handles form logic - only mounted when theme is available
interface iThemeEditFormProps {
  theme: ThemeDetailQueryReturnType;
  seriesId: string;
  onClose: () => void;
}

function ThemeEditForm({ theme, seriesId, onClose }: iThemeEditFormProps) {
  const { updateTheme, isPending: isUpdating } = useUpdateTheme();

  // Fetch data for dropdowns
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);

  const scripts = scriptsData?.items ?? [];
  const characters = charactersData?.items ?? [];

  // State for array fields - initialize with theme data
  const [visualMotifs, setVisualMotifs] = useState<string[]>(theme.visualMotifs ?? []);
  const [motifInput, setMotifInput] = useState('');
  const [relatedCharacters, setRelatedCharacters] = useState<iCharacterConnection[]>(theme.relatedCharacters ?? []);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [connectionInput, setConnectionInput] = useState('');
  const [evolution, setEvolution] = useState<iThemeEvolution[]>(theme.evolution ?? []);
  const [selectedEvolutionScriptId, setSelectedEvolutionScriptId] = useState('');
  const [evolutionNotesInput, setEvolutionNotesInput] = useState('');

  const form = useAppForm({
    defaultValues: {
      name: theme.name,
      description: theme.description ?? '',
      color: theme.color ?? '',
    },
    onSubmit: async ({ value }) => {
      updateTheme({
        themeId: theme._id,
        patch: {
          name: value.name || undefined,
          description: value.description || undefined,
          color: value.color || undefined,
          visualMotifs: visualMotifs.length > 0 ? visualMotifs : undefined,
          relatedCharacters: relatedCharacters.length > 0 ? relatedCharacters : undefined,
          evolution: evolution.length > 0 ? evolution : undefined,
        },
      });
    },
    validators: {
      onSubmit: themeEditSchema,
    },
  });

  const { handleAutoSave } = useAutoSave(form, { isUpdating });

  // Visual motif management
  const handleAddMotif = () => {
    if (motifInput.trim()) {
      const newMotifs = [...visualMotifs, motifInput.trim()];
      setVisualMotifs(newMotifs);
      setMotifInput('');
      handleAutoSave();
    }
  };

  const handleRemoveMotif = (index: number) => {
    const updatedMotifs = visualMotifs.filter((_, i) => i !== index);
    setVisualMotifs(updatedMotifs);
    handleAutoSave();
  };

  // Character connection management
  const handleAddCharacter = () => {
    if (selectedCharacterId && connectionInput.trim()) {
      if (!relatedCharacters.some((c) => c.characterId === selectedCharacterId)) {
        const newConnections = [
          ...relatedCharacters,
          { characterId: selectedCharacterId, connection: connectionInput.trim() },
        ];
        setRelatedCharacters(newConnections);
        setSelectedCharacterId('');
        setConnectionInput('');
        handleAutoSave();
      }
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    setRelatedCharacters(relatedCharacters.filter((c) => c.characterId !== characterId));
    handleAutoSave();
  };

  // Evolution management
  const handleAddEvolution = () => {
    if (selectedEvolutionScriptId && evolutionNotesInput.trim()) {
      if (!evolution.some((e) => e.scriptId === selectedEvolutionScriptId)) {
        const newEvolution = [...evolution, { scriptId: selectedEvolutionScriptId, notes: evolutionNotesInput.trim() }];
        setEvolution(newEvolution);
        setSelectedEvolutionScriptId('');
        setEvolutionNotesInput('');
        handleAutoSave();
      }
    }
  };

  const handleRemoveEvolution = (scriptId: string) => {
    setEvolution(evolution.filter((e) => e.scriptId !== scriptId));
    handleAutoSave();
  };

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
          <h2 className="text-lg font-bold">Edit Theme</h2>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <form.AppForm key={theme._id}>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Core details about this theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Name */}
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label="Theme Name"
                        placeholder="e.g., Redemption, Loss of Innocence"
                        required
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  {/* Color */}
                  <form.AppField name="color">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="color-select">Color</Label>
                        <div className="flex items-center gap-2">
                          <SingleSelect
                            id="color-select"
                            value={field.state.value ?? ''}
                            onValueChange={(value: string | null) => {
                              field.handleChange(value ?? '');
                              handleAutoSave();
                            }}
                            options={[
                              { value: '', label: 'No color' },
                              ...PRESET_COLORS.map((c) => ({ value: c.value, label: c.label })),
                            ]}
                            placeholder="Select color"
                          />
                          {field.state.value ? (
                            <div
                              className="size-8 shrink-0 rounded-md border-2 border-foreground"
                              style={{ backgroundColor: field.state.value }}
                              title={field.state.value}
                            />
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">Color used for visual identification in the UI</p>
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
                        placeholder="Describe the theme, its significance to the story, and how it manifests..."
                        rows={4}
                        maxLength={1000}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Visual Motifs Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Visual Motifs</CardTitle>
                <CardDescription>
                  Recurring visual elements that represent this theme ({visualMotifs.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Existing motifs */}
                  {visualMotifs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {visualMotifs.map((motif) => (
                        <Badge key={motif} variant="secondary" className="flex items-center gap-1 py-1.5">
                          <LuPalette className="size-3" />
                          {motif}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMotif(visualMotifs.indexOf(motif))}
                            className="ml-1 size-4 p-0 hover:bg-destructive/20"
                          >
                            <LuTrash2 className="size-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {/* Add new motif */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Mirrors, Rain, Red color"
                      value={motifInput}
                      onChange={(e) => setMotifInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMotif();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddMotif} disabled={!motifInput.trim()}>
                      <LuPlus className="mr-1 size-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Characters Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Related Characters</CardTitle>
                <CardDescription>Characters connected to this theme ({relatedCharacters.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Existing character connections */}
                  {relatedCharacters.length > 0 && (
                    <div className="space-y-2">
                      {relatedCharacters.map((rel) => {
                        const character = characters.find((c) => c._id === rel.characterId);
                        return (
                          <div
                            key={rel.characterId}
                            className="flex items-center justify-between rounded-md border border-border p-3"
                          >
                            <div>
                              <p className="font-medium">{character?.name ?? 'Unknown Character'}</p>
                              <p className="text-sm text-muted-foreground">{rel.connection}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCharacter(rel.characterId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <LuTrash2 className="size-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add new character connection */}
                  <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                    <span className="text-sm font-medium">Add Character Connection</span>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <SingleSelect
                        value={selectedCharacterId}
                        onValueChange={(value) => setSelectedCharacterId(value ?? '')}
                        options={characters
                          .filter((c) => !relatedCharacters.some((r) => r.characterId === c._id))
                          .map((c) => ({ value: c._id, label: c.name }))}
                        placeholder="Select character"
                      />
                      <Input
                        placeholder="How they embody this theme..."
                        value={connectionInput}
                        onChange={(e) => setConnectionInput(e.target.value)}
                        className="md:col-span-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddCharacter}
                        disabled={!selectedCharacterId || !connectionInput.trim()}
                      >
                        <LuPlus className="mr-1 size-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Evolution Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Theme Evolution</CardTitle>
                <CardDescription>How this theme develops throughout the scripts ({evolution.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Existing evolution entries */}
                  {evolution.length > 0 && (
                    <div className="space-y-2">
                      {evolution.map((evo) => {
                        const script = scripts.find((s) => s._id === evo.scriptId);
                        return (
                          <div
                            key={evo.scriptId}
                            className="flex items-center justify-between rounded-md border border-border p-3"
                          >
                            <div>
                              <p className="font-medium">{script?.title ?? 'Unknown Script'}</p>
                              <p className="text-sm text-muted-foreground">{evo.notes}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEvolution(evo.scriptId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <LuTrash2 className="size-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add new evolution entry */}
                  <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                    <span className="text-sm font-medium">Add Evolution Note</span>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <SingleSelect
                        value={selectedEvolutionScriptId}
                        onValueChange={(value) => setSelectedEvolutionScriptId(value ?? '')}
                        options={scripts
                          .filter((s) => !evolution.some((e) => e.scriptId === s._id))
                          .map((s) => ({ value: s._id, label: s.title }))}
                        placeholder="Select script"
                      />
                      <Input
                        placeholder="How the theme evolves in this script..."
                        value={evolutionNotesInput}
                        onChange={(e) => setEvolutionNotesInput(e.target.value)}
                        className="md:col-span-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddEvolution}
                        disabled={!selectedEvolutionScriptId || !evolutionNotesInput.trim()}
                      >
                        <LuPlus className="mr-1 size-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form.Form>
        </form.AppForm>
      </ScrollArea>
    </div>
  );
}

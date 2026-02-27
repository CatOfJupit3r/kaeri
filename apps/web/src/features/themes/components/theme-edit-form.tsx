import { EditPanelWrapper } from '@~/components/forms';
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
import { CharacterConnectionField, EvolutionField, TagArrayField } from '@~/components/ui/form-fields';
import { Label } from '@~/components/ui/label';
import { SingleSelect } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateTheme } from '../hooks/mutations/use-update-theme';
import type { ThemeDetailQueryReturnType } from '../hooks/queries/use-theme';
import { themeEditSchema } from '../schemas/theme.schema';
import { ThemeFormFields } from './theme-form-fields';

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

interface iThemeEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: ThemeDetailQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Unified edit form for themes.
 * Supports both panel mode (auto-save on blur) and dialog mode (manual submit).
 *
 * @param mode - 'panel' for inline panel editing, 'dialog' for modal editing
 * @param initialData - Required theme data (parent fetches this)
 */
export function ThemeEditForm({ mode, seriesId, initialData, onClose, open, onOpenChange }: iThemeEditFormProps) {
  const { updateTheme, isPending: isUpdating } = useUpdateTheme();

  // Fetch data for dropdowns
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);

  const scripts = scriptsData?.items ?? [];
  const characters = charactersData?.items ?? [];

  const form = useAppForm({
    defaultValues: {
      name: initialData.name,
      description: initialData.description ?? '',
      color: initialData.color ?? '',
      visualMotifs: initialData.visualMotifs ?? [],
      relatedCharacters: initialData.relatedCharacters ?? [],
      evolution: initialData.evolution ?? [],
    },
    onSubmit: async ({ value }) => {
      updateTheme(
        {
          themeId: initialData._id,
          patch: {
            name: value.name || undefined,
            description: value.description || undefined,
            color: value.color || undefined,
            visualMotifs: value.visualMotifs.length > 0 ? value.visualMotifs : undefined,
            relatedCharacters: value.relatedCharacters.length > 0 ? value.relatedCharacters : undefined,
            evolution: value.evolution.length > 0 ? value.evolution : undefined,
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
      onSubmit: themeEditSchema,
    },
  });

  // Auto-save only enabled in panel mode
  const { handleAutoSave } = useAutoSave(form, {
    isUpdating,
    enabled: mode === EDIT_FORM_MODES.panel,
  });

  const handleBlur = mode === EDIT_FORM_MODES.panel ? handleAutoSave : undefined;

  // Panel form content
  const panelFormContent = (
    <form.AppForm key={initialData._id}>
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
                    onBlur={handleBlur}
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
                          if (handleBlur) handleBlur();
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
                    onBlur={handleBlur}
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
            <CardDescription>Recurring visual elements that represent this theme</CardDescription>
          </CardHeader>
          <CardContent>
            <form.AppField name="visualMotifs">
              {() => <TagArrayField label="" placeholder="e.g., Mirrors, Rain, Red color" onChange={handleBlur} />}
            </form.AppField>
          </CardContent>
        </Card>

        {/* Related Characters Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Related Characters</CardTitle>
            <CardDescription>Characters connected to this theme</CardDescription>
          </CardHeader>
          <CardContent>
            <form.AppField name="relatedCharacters">
              {() => (
                <CharacterConnectionField
                  label=""
                  characters={characters}
                  characterPlaceholder="Select character"
                  connectionPlaceholder="How they embody this theme..."
                  onChange={handleBlur}
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        {/* Theme Evolution Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Theme Evolution</CardTitle>
            <CardDescription>How this theme develops throughout the scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <form.AppField name="evolution">
              {() => (
                <EvolutionField
                  label=""
                  scripts={scripts}
                  scriptPlaceholder="Select script"
                  notesPlaceholder="How the theme evolves in this script..."
                  onChange={handleBlur}
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>
      </form.Form>
    </form.AppForm>
  );

  // Dialog form content (simpler layout for quick edits)
  const dialogFormContent = (
    <form.AppForm>
      <form.Form className="space-y-4 p-0">
        <ThemeFormFields form={form} />

        <DialogFooter>
          <form.FormActions
            onCancel={() => onOpenChange?.(false)}
            submitLabel="Update Theme"
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
      <EditPanelWrapper title="Edit Theme" onClose={onClose}>
        {panelFormContent}
      </EditPanelWrapper>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Theme</DialogTitle>
          <DialogDescription>Update the theme details below.</DialogDescription>
        </DialogHeader>
        {dialogFormContent}
      </DialogContent>
    </Dialog>
  );
}

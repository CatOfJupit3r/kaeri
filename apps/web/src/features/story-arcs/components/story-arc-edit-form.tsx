import { EditPanelWrapper } from '@~/components/forms';
import { Badge } from '@~/components/ui/badge';
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
import { StoryArcFormFields } from './story-arc-form-fields';

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

  const form = useAppForm({
    defaultValues: {
      name: initialData.name,
      description: initialData.description ?? '',
      status: initialData.status,
      startScriptId: initialData.startScriptId ?? '',
      endScriptId: initialData.endScriptId ?? '',
      resolution: initialData.resolution ?? '',
      keyBeats: initialData.keyBeats ?? [],
      characters: initialData.characters ?? [],
      themeIds: initialData.themeIds ?? ([] as string[]),
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
            keyBeats: value.keyBeats.length > 0 ? value.keyBeats : undefined,
            resolution: value.resolution || undefined,
            characters: value.characters.length > 0 ? value.characters : undefined,
            themeIds: value.themeIds.length > 0 ? value.themeIds : undefined,
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
              <CardDescription>Important story moments</CardDescription>
            </CardHeader>
            <CardContent>
              <form.AppField name="keyBeats">
                {(field) => (
                  <field.KeyBeatsField
                    label=""
                    placeholder="Add a beat..."
                    disabled={isUpdating}
                    showReorder
                    onChange={handleAutoSave}
                  />
                )}
              </form.AppField>
            </CardContent>
          </Card>

          {/* Characters Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Characters</CardTitle>
              <CardDescription>Characters and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <form.AppField name="characters">
                {(field) => (
                  <field.CharacterRoleField
                    label=""
                    characters={characters}
                    characterPlaceholder="Select character"
                    rolePlaceholder="Role (e.g., protagonist)"
                    disabled={isUpdating}
                    onChange={handleAutoSave}
                  />
                )}
              </form.AppField>
            </CardContent>
          </Card>

          {/* Themes Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Themes</CardTitle>
              <CardDescription>Associated themes</CardDescription>
            </CardHeader>
            <CardContent>
              <form.AppField name="themeIds">
                {(field) => (
                  <field.EntityPickerField
                    label=""
                    options={themes.map((t) => ({ value: t._id, label: t.name }))}
                    placeholder="Add theme"
                    disabled={isUpdating}
                    onChange={handleAutoSave}
                  />
                )}
              </form.AppField>
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
        <StoryArcFormFields form={form} scripts={scripts} />

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

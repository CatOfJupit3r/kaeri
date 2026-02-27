import { EditPanelWrapper } from '@~/components/forms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
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
import { SceneFormFields } from './scene-form-fields';

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
            beats: value.beats.length > 0 ? value.beats : undefined,
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

  const script = scripts.find((s) => s._id === initialData.scriptId);

  // Build options for SceneFormFields
  const locationOptions = locations.map((l) => ({ label: l.name, value: l._id }));
  const characterOptions = characters.map((c) => ({ label: c.name, value: c._id }));
  const propOptions = props.map((p) => ({ label: p.name, value: p._id }));

  // --- PANEL MODE ---
  if (isPanelMode) {
    return (
      <EditPanelWrapper title={`Edit Scene #${initialData.sceneNumber}`} onClose={onClose}>
        <form.AppForm key={initialData._id}>
          <form.Form className="space-y-4 p-4">
            {/* Script info (read-only) */}
            <p className="text-sm text-muted-foreground">
              Scene in script: <span className="font-medium">{script?.title ?? 'Unknown'}</span>
            </p>

            <SceneFormFields
              form={form}
              isPending={isUpdating}
              locationOptions={locationOptions}
              characterOptions={characterOptions}
              propOptions={propOptions}
              onFieldBlur={handleAutoSave}
              onFieldChange={handleAutoSave}
            />
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
            <SceneFormFields
              form={form}
              isPending={isUpdating}
              locationOptions={locationOptions}
              characterOptions={characterOptions}
              propOptions={propOptions}
            />

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

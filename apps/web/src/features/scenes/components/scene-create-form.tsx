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

import { useCreateScene } from '../hooks/mutations/use-create-scene';
import { sceneFormSchema } from '../schemas/scene.schema';
import type { iSceneBeat } from './scene-form-fields';
import { SceneFormFields } from './scene-form-fields';

interface iSceneCreateFormProps {
  seriesId: string;
  scripts: Array<{ _id: string; title: string }>;
  locations: Array<{ _id: string; name: string }>;
  characters: Array<{ _id: string; name: string }>;
  props: Array<{ _id: string; name: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SceneCreateForm({
  seriesId,
  scripts,
  locations,
  characters,
  props,
  open,
  onOpenChange,
}: iSceneCreateFormProps) {
  const { createScene, isPending } = useCreateScene();

  const locationOptions = locations.map((l) => ({ label: l.name, value: l._id }));
  const characterOptions = characters.map((c) => ({ label: c.name, value: c._id }));
  const propOptions = props.map((p) => ({ label: p.name, value: p._id }));

  const form = useAppForm({
    defaultValues: {
      scriptId: '',
      heading: '',
      locationId: '',
      timeOfDay: '',
      duration: '',
      emotionalTone: '',
      conflict: '',
      beats: [] as iSceneBeat[],
      characterIds: [] as string[],
      propIds: [] as string[],
      lighting: '',
      sound: '',
      camera: '',
      storyNotes: '',
      storyboardUrl: '',
    },
    onSubmit: async ({ value }) => {
      createScene(
        {
          seriesId,
          scriptId: value.scriptId,
          heading: value.heading,
          locationId: value.locationId || undefined,
          timeOfDay: value.timeOfDay || undefined,
          duration: value.duration || undefined,
          emotionalTone: value.emotionalTone || undefined,
          conflict: value.conflict || undefined,
          beats: value.beats.length > 0 ? value.beats : undefined,
          characterIds: value.characterIds.length > 0 ? value.characterIds : undefined,
          propIds: value.propIds.length > 0 ? value.propIds : undefined,
          lighting: value.lighting || undefined,
          sound: value.sound || undefined,
          camera: value.camera || undefined,
          storyNotes: value.storyNotes || undefined,
          storyboardUrl: value.storyboardUrl || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    },
    validators: {
      onSubmit: sceneFormSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Scene</DialogTitle>
          <DialogDescription>Add a new scene to your script.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            {/* Script Selection - separate because it's create-form specific */}
            <form.Field name="scriptId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Script <span className="text-destructive">*</span>
                  </Label>
                  <SingleSelect
                    inputId={field.name}
                    value={field.state.value || null}
                    onValueChange={(value) => field.handleChange(value ?? '')}
                    options={scripts.map((script) => ({ label: script.title, value: script._id }))}
                    placeholder="Select a script"
                    isDisabled={isPending}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <SceneFormFields
              form={form}
              isPending={isPending}
              locationOptions={locationOptions}
              characterOptions={characterOptions}
              propOptions={propOptions}
            />

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Scene"
                loadingLabel="Creating..."
                isDisabled={isPending}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

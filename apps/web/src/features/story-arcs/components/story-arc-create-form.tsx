import { useEffect } from 'react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';

import { useCreateStoryArc } from '../hooks/mutations/use-create-story-arc';
import type { StoryArcStatus } from '../schemas/story-arc.schema';
import { storyArcFormSchema } from '../schemas/story-arc.schema';
import type { iBeat, iCharacterRole } from './story-arc-form-fields';
import { StoryArcFormFields } from './story-arc-form-fields';

interface iScript {
  _id: string;
  title: string;
}

interface iCharacter {
  _id: string;
  name: string;
}

interface iTheme {
  _id: string;
  name: string;
}

interface iStoryArcCreateFormProps {
  seriesId: string;
  scripts: iScript[];
  characters: iCharacter[];
  themes: iTheme[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create form for story arcs.
 * Renders in a dialog with manual submit.
 */
export function StoryArcCreateForm({
  seriesId,
  scripts,
  characters,
  themes,
  open,
  onOpenChange,
}: iStoryArcCreateFormProps) {
  const { createStoryArc, isPending } = useCreateStoryArc();

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'planned' as StoryArcStatus,
      startScriptId: '',
      endScriptId: '',
      resolution: '',
      keyBeats: [] as iBeat[],
      characters: [] as iCharacterRole[],
      themeIds: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const payload = {
        seriesId,
        name: value.name,
        description: value.description,
        status: value.status,
        startScriptId: value.startScriptId || undefined,
        endScriptId: value.endScriptId || undefined,
        keyBeats: value.keyBeats
          .filter((b) => b.description.trim())
          .map((b) => ({
            ...b,
            id: b.id ?? crypto.randomUUID(),
          })),
        resolution: value.resolution || undefined,
        characters: value.characters,
        themeIds: value.themeIds,
      };

      createStoryArc(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    },
    validators: {
      onSubmit: storyArcFormSchema,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Story Arc</DialogTitle>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <StoryArcFormFields form={form} scripts={scripts} />

            {/* Key Beats */}
            <form.AppField name="keyBeats" mode="array">
              {(field) => (
                <field.KeyBeatsField label="Key Beats" placeholder="Add a beat..." disabled={isPending} showReorder />
              )}
            </form.AppField>

            {/* Characters */}
            <form.AppField name="characters" mode="array">
              {(field) => (
                <field.CharacterRoleField
                  label="Characters"
                  characters={characters}
                  characterPlaceholder="Select character"
                  rolePlaceholder="Role (e.g., protagonist)"
                  disabled={isPending}
                />
              )}
            </form.AppField>

            {/* Themes */}
            <form.AppField name="themeIds" mode="array">
              {(field) => (
                <field.EntityPickerField
                  label="Themes"
                  options={themes.map((t) => ({ value: t._id, label: t.name }))}
                  placeholder="Add theme"
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <DialogFooter>
              <form.FormActions
                onCancel={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                submitLabel="Create"
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

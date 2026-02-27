import { withForm } from '@~/components/ui/field';

/**
 * Shared character form fields using withForm pattern.
 * Contains basic text fields only - complex array fields (traits, relationships, appearances)
 * are handled directly in the form components.
 */
export const CharacterFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    avatarUrl: '',
    traits: [] as string[],
    relationships: [] as Array<{ targetId: string; type: string; note?: string }>,
    appearances: [] as Array<{ scriptId: string; sceneRef: string; locationId?: string }>,
  },
  props: {} as { isPending?: boolean },
  render: function Render({ form, isPending }) {
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="name">
            {(field) => (
              <field.TextField label="Name" placeholder="Enter character name" required disabled={isPending} />
            )}
          </form.AppField>

          <form.AppField name="avatarUrl">
            {(field) => (
              <field.TextField label="Avatar URL" placeholder="https://example.com/avatar.jpg" disabled={isPending} />
            )}
          </form.AppField>
        </div>

        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              label="Description"
              placeholder="Describe the character's background, personality, and role in the story..."
              rows={3}
              maxLength={500}
              disabled={isPending}
            />
          )}
        </form.AppField>
      </>
    );
  },
});

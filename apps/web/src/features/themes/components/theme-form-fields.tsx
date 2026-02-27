import { withForm } from '@~/components/ui/field';

const COLOR_OPTIONS = [
  { value: '', label: 'No color' },
  { value: '#EF4444', label: 'Red' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EAB308', label: 'Yellow' },
  { value: '#22C55E', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#A855F7', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
] as const;

interface iCharacterConnection {
  characterId: string;
  connection: string;
}

interface iThemeEvolution {
  scriptId: string;
  notes: string;
}

export type { iCharacterConnection, iThemeEvolution };

interface iThemeFormFieldsProps {
  /** Optional blur handler for auto-save (panel mode only) */
  handleBlur?: () => void;
}

/**
 * Shared basic form fields for theme forms.
 * Used by both create and edit forms.
 * Array fields (visualMotifs, relatedCharacters, evolution) should be added separately in parent forms.
 */
export const ThemeFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    color: '',
    visualMotifs: [] as string[],
    relatedCharacters: [] as iCharacterConnection[],
    evolution: [] as iThemeEvolution[],
  },
  props: {} as iThemeFormFieldsProps,
  render: function Render({ form, handleBlur }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField label="Theme Name" placeholder="Enter theme name" required onBlur={handleBlur} />
          )}
        </form.AppField>

        <form.AppField name="color">
          {(field) => (
            <field.SelectField label="Color" placeholder="Select a color" options={COLOR_OPTIONS} onBlur={handleBlur} />
          )}
        </form.AppField>

        <div className="sm:col-span-2">
          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Description"
                placeholder="Describe the theme..."
                rows={3}
                maxLength={500}
                onBlur={handleBlur}
              />
            )}
          </form.AppField>
        </div>
      </div>
    );
  },
});

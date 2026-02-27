import { withForm } from '@~/components/ui/field';

const COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
] as const;

interface iThemeFormFieldsProps {
  /** Optional blur handler for auto-save (panel mode only) */
  handleBlur?: () => void;
}

/**
 * Shared basic form fields for theme forms.
 * Used by both create and edit forms.
 * Note: Complex array fields (visualMotifs, relatedCharacters, evolution, appearances)
 * are managed with local state in the parent form components.
 */
export const ThemeFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    color: '',
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

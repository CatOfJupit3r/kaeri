import { withForm } from '@~/components/ui/field';

export const TIME_OF_DAY_OPTIONS = [
  { label: 'Dawn', value: 'dawn' },
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
  { label: 'Dusk', value: 'dusk' },
  { label: 'Night', value: 'night' },
] as const;

/**
 * Shared location form fields using withForm pattern.
 * Contains basic text fields only - complex array fields (images, tags, associations)
 * are handled directly in the form components.
 */
export const LocationFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    tags: [] as string[],
    associatedCharacterIds: [] as string[],
    propIds: [] as string[],
    productionNotes: '',
    mood: '',
    timeOfDay: [] as string[],
  },
  props: {} as { isPending?: boolean },
  render: function Render({ form, isPending }) {
    return (
      <>
        <form.AppField name="name">
          {(field) => <field.TextField label="Name" placeholder="Enter location name" required disabled={isPending} />}
        </form.AppField>

        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              label="Description"
              placeholder="Describe the location's atmosphere, key features, and significance..."
              rows={3}
              maxLength={500}
              disabled={isPending}
            />
          )}
        </form.AppField>

        <form.AppField name="mood">
          {(field) => (
            <field.TextField label="Mood" placeholder="Enter mood (e.g., tense, peaceful)" disabled={isPending} />
          )}
        </form.AppField>
      </>
    );
  },
});

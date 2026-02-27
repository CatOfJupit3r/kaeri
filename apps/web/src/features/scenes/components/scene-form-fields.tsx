import { withForm } from '@~/components/ui/field';

export const TIME_OF_DAY_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'DAY', label: 'Day' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'DAWN', label: 'Dawn' },
  { value: 'DUSK', label: 'Dusk' },
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'CONTINUOUS', label: 'Continuous' },
] as const;

export interface iSceneBeat {
  order: number;
  description: string;
}

/**
 * Shared scene form fields using withForm pattern.
 * Contains basic text fields only - complex array fields (beats, characterIds, propIds)
 * are handled directly in the form components.
 */
export const SceneFormFields = withForm({
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
  props: {} as { isPending?: boolean },
  render: function Render({ form, isPending }) {
    return (
      <>
        <form.AppField name="heading">
          {(field) => (
            <field.TextField
              label="Heading"
              placeholder="INT. COFFEE SHOP - DAY"
              required
              maxLength={200}
              disabled={isPending}
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="duration">
            {(field) => <field.TextField label="Duration" placeholder="2 pages" disabled={isPending} />}
          </form.AppField>

          <form.AppField name="emotionalTone">
            {(field) => <field.TextField label="Emotional Tone" placeholder="Tense, Chaotic" disabled={isPending} />}
          </form.AppField>
        </div>

        <form.AppField name="conflict">
          {(field) => (
            <field.TextareaField
              label="Conflict"
              placeholder="Describe the conflict..."
              rows={3}
              maxLength={1000}
              disabled={isPending}
            />
          )}
        </form.AppField>
      </>
    );
  },
});

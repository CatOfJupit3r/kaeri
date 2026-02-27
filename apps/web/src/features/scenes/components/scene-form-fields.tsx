import { withForm } from '@~/components/ui/field';
import type { iOptionType } from '@~/components/ui/select';

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

export interface iSceneFormFieldsProps {
  isPending?: boolean;
  /** Location options for the select. */
  locationOptions?: iOptionType[];
  /** Character options for multi-select. */
  characterOptions?: iOptionType[];
  /** Prop options for multi-select. */
  propOptions?: iOptionType[];
  /** Callback for auto-save on field blur */
  onFieldBlur?: () => void;
  /** Callback for auto-save on field change (for array fields) */
  onFieldChange?: () => void;
}

/**
 * Shared scene form fields using withForm pattern.
 * Layout matches edit form panel mode with proper grid layouts.
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
  props: {} as iSceneFormFieldsProps,
  render: function Render({
    form,
    isPending,
    locationOptions,
    characterOptions,
    propOptions,
    onFieldBlur,
    onFieldChange,
  }) {
    return (
      <>
        {/* Scene Heading */}
        <form.AppField name="heading">
          {(field) => (
            <field.TextField
              label="Scene Heading"
              placeholder="e.g., INT. COFFEE SHOP - DAY"
              required
              maxLength={200}
              disabled={isPending}
              onBlur={onFieldBlur}
            />
          )}
        </form.AppField>

        {/* Location, Time of Day, Duration row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {locationOptions ? (
            <form.AppField name="locationId">
              {(field) => (
                <field.SelectField
                  label="Location"
                  options={[{ value: '', label: 'None' }, ...locationOptions]}
                  placeholder="Select location"
                  onBlur={onFieldBlur}
                />
              )}
            </form.AppField>
          ) : null}

          <form.AppField name="timeOfDay">
            {(field) => (
              <field.SelectField
                label="Time of Day"
                options={TIME_OF_DAY_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
                placeholder="Select time"
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>

          <form.AppField name="duration">
            {(field) => (
              <field.TextField
                label="Duration"
                placeholder="e.g., 2 min 30 sec"
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>
        </div>

        {/* Emotional Tone & Conflict row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.AppField name="emotionalTone">
            {(field) => (
              <field.TextField
                label="Emotional Tone"
                placeholder="e.g., Tense, Romantic, Comedic"
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>

          <form.AppField name="conflict">
            {(field) => (
              <field.TextField
                label="Conflict"
                placeholder="e.g., Character vs Character"
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>
        </div>

        {/* Story Notes */}
        <form.AppField name="storyNotes">
          {(field) => (
            <field.TextareaField
              label="Story Notes"
              placeholder="Additional notes about this scene's narrative purpose..."
              rows={4}
              maxLength={2000}
              disabled={isPending}
              onBlur={onFieldBlur}
            />
          )}
        </form.AppField>

        {/* Scene Beats */}
        <form.AppField name="beats">
          {(field) => (
            <field.KeyBeatsField
              label="Scene Beats"
              placeholder="e.g., Character enters and confronts antagonist"
              disabled={isPending}
              showReorder
              onChange={onFieldChange}
            />
          )}
        </form.AppField>

        {/* Characters & Props row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {characterOptions ? (
            <form.AppField name="characterIds">
              {(field) => (
                <field.MultiSelectField
                  label="Characters in Scene"
                  options={characterOptions}
                  placeholder="Select characters..."
                  closeMenuOnSelect={false}
                  onBlur={onFieldBlur}
                />
              )}
            </form.AppField>
          ) : null}

          {propOptions ? (
            <form.AppField name="propIds">
              {(field) => (
                <field.MultiSelectField
                  label="Props in Scene"
                  options={propOptions}
                  placeholder="Select props..."
                  closeMenuOnSelect={false}
                  onBlur={onFieldBlur}
                />
              )}
            </form.AppField>
          ) : null}
        </div>

        {/* Technical Details - 3 column grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <form.AppField name="lighting">
            {(field) => (
              <field.TextField
                label="Lighting"
                placeholder="e.g., Natural, Low-key"
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>

          <form.AppField name="sound">
            {(field) => (
              <field.TextField
                label="Sound"
                placeholder="e.g., Ambient city noise"
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>

          <form.AppField name="camera">
            {(field) => (
              <field.TextField
                label="Camera"
                placeholder="e.g., Wide establishing shot"
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>
        </div>

        {/* Storyboard URL */}
        <form.AppField name="storyboardUrl">
          {(field) => (
            <field.TextField
              label="Storyboard URL"
              placeholder="https://..."
              disabled={isPending}
              onBlur={onFieldBlur}
            />
          )}
        </form.AppField>
      </>
    );
  },
});

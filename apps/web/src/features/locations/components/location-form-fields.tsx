import { withForm } from '@~/components/ui/field';
import type { iOptionType } from '@~/components/ui/select';

export const TIME_OF_DAY_OPTIONS = [
  { label: 'Dawn', value: 'dawn' },
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
  { label: 'Dusk', value: 'dusk' },
  { label: 'Night', value: 'night' },
] as const;

export interface iImage {
  url: string;
  caption?: string;
}

export interface iLocationFormFieldsProps {
  isPending?: boolean;
  /** Character options for the multi-select. If provided, renders the characters field. */
  characterOptions?: iOptionType[];
  /** Prop options for the multi-select. If provided, renders the props field. */
  propOptions?: iOptionType[];
  /** Callback for auto-save on field blur */
  onFieldBlur?: () => void;
  /** Callback for auto-save on field change (for array fields) */
  onFieldChange?: () => void;
}

/**
 * Shared location form fields using withForm pattern.
 * Layout matches edit form panel mode: 2-column grid for name/mood, full-width description,
 * then images, associations, time of day, production notes, and tags.
 */
export const LocationFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    tags: [] as string[],
    images: [] as iImage[],
    associatedCharacterIds: [] as string[],
    propIds: [] as string[],
    productionNotes: '',
    mood: '',
    timeOfDay: [] as string[],
  },
  props: {} as iLocationFormFieldsProps,
  render: function Render({ form, isPending, characterOptions, propOptions, onFieldBlur, onFieldChange }) {
    return (
      <>
        {/* Name & Mood row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Name"
                placeholder="Enter location name"
                required
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>

          <form.AppField name="mood">
            {(field) => (
              <field.TextField
                label="Mood"
                placeholder="Enter mood (e.g., tense, peaceful)"
                disabled={isPending}
                onBlur={onFieldBlur}
              />
            )}
          </form.AppField>
        </div>

        {/* Description */}
        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              label="Description"
              placeholder="Describe the location's atmosphere, key features, and significance..."
              rows={4}
              maxLength={500}
              disabled={isPending}
              onBlur={onFieldBlur}
            />
          )}
        </form.AppField>

        {/* Reference Images */}
        <form.AppField name="images">
          {(field) => (
            <field.ImageArrayField
              label="Reference Images"
              urlPlaceholder="Image URL"
              captionPlaceholder="Caption (optional)"
              disabled={isPending}
              onChange={onFieldChange}
            />
          )}
        </form.AppField>

        {/* Associations row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {characterOptions ? (
            <form.AppField name="associatedCharacterIds">
              {(field) => (
                <field.MultiSelectField
                  label="Associated Characters"
                  options={characterOptions}
                  placeholder="Select characters..."
                  isDisabled={isPending}
                  isClearable
                  onBlur={onFieldBlur}
                />
              )}
            </form.AppField>
          ) : null}

          {propOptions ? (
            <form.AppField name="propIds">
              {(field) => (
                <field.MultiSelectField
                  label="Props Used"
                  options={propOptions}
                  placeholder="Select props..."
                  isDisabled={isPending}
                  isClearable
                  onBlur={onFieldBlur}
                />
              )}
            </form.AppField>
          ) : null}
        </div>

        {/* Time of Day */}
        <form.AppField name="timeOfDay">
          {(field) => (
            <field.MultiSelectField
              label="Time of Day"
              options={[...TIME_OF_DAY_OPTIONS]}
              placeholder="Select time of day..."
              isDisabled={isPending}
              isClearable
              onBlur={onFieldBlur}
            />
          )}
        </form.AppField>

        {/* Production Notes */}
        <form.AppField name="productionNotes">
          {(field) => (
            <field.TextareaField
              label="Production Notes"
              placeholder="Add production notes..."
              rows={4}
              maxLength={1000}
              disabled={isPending}
              onBlur={onFieldBlur}
            />
          )}
        </form.AppField>

        {/* Tags */}
        <form.AppField name="tags">
          {(field) => (
            <field.TagArrayField
              label="Tags"
              placeholder="Add a tag (press Enter)"
              disabled={isPending}
              onChange={onFieldChange}
            />
          )}
        </form.AppField>
      </>
    );
  },
});

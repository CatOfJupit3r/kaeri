import { withForm } from '@~/components/ui/field';

interface iTimelineFormFieldsProps {
  /** Optional blur handler for auto-save (panel mode only) */
  handleBlur?: () => void;
}

/**
 * Shared form fields for timeline entry forms.
 * Used by both create and edit forms.
 */
export const TimelineFormFields = withForm({
  defaultValues: {
    label: '',
    timestamp: '',
  },
  props: {} as iTimelineFormFieldsProps,
  render: function Render({ form, handleBlur }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="label">
          {(field) => <field.TextField label="Label" placeholder="Enter timeline label" required onBlur={handleBlur} />}
        </form.AppField>

        <form.AppField name="timestamp">
          {(field) => (
            <field.TextField
              label="Date"
              placeholder="YYYY-MM-DD"
              type="date"
              description="Optional: Provide a date for chronological ordering"
              onBlur={handleBlur}
            />
          )}
        </form.AppField>
      </div>
    );
  },
});

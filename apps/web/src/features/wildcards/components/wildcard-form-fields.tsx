import { withForm } from '@~/components/ui/field';

interface iWildcardFormFieldsProps {
  /** Optional blur handler for auto-save (panel mode only) */
  handleBlur?: () => void;
}

/**
 * Shared form fields for wildcard forms.
 * Used by both create and edit forms.
 */
export const WildcardFormFields = withForm({
  defaultValues: {
    title: '',
    body: '',
    tag: '',
  },
  props: {} as iWildcardFormFieldsProps,
  render: function Render({ form, handleBlur }) {
    return (
      <>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <form.AppField name="title">
              {(field) => (
                <field.TextField label="Title" placeholder="Enter Wild Card title" required onBlur={handleBlur} />
              )}
            </form.AppField>
          </div>

          <form.AppField name="tag">
            {(field) => <field.TextField label="Tag" placeholder="Optional tag" maxLength={50} onBlur={handleBlur} />}
          </form.AppField>
        </div>

        <form.AppField name="body">
          {(field) => (
            <field.TextareaField
              label="Content"
              placeholder="Enter the Wild Card content..."
              rows={5}
              maxLength={1000}
              onBlur={handleBlur}
            />
          )}
        </form.AppField>
      </>
    );
  },
});

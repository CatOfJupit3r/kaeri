import { withForm } from '@~/components/ui/field';
import { Label } from '@~/components/ui/label';
import { SingleSelect } from '@~/components/ui/select';

import type { StoryArcStatus } from '../schemas/story-arc.schema';

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
] as const;

interface iScript {
  _id: string;
  title: string;
}

interface iBeat {
  id: string;
  order: number;
  description: string;
  scriptId?: string;
  sceneId?: string;
}

interface iCharacterRole {
  characterId: string;
  role: string;
}

export type { iBeat, iCharacterRole };

interface iStoryArcFormFieldsProps {
  /** Scripts for dropdown selections */
  scripts?: iScript[];
  /** Optional blur handler for auto-save (panel mode only) */
  handleBlur?: () => void;
}

/**
 * Shared basic form fields for story arc forms.
 * Used by both create and edit forms.
 * Array fields (keyBeats, characters, themeIds) should be added separately in parent forms.
 */
export const StoryArcFormFields = withForm({
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
  props: {} as iStoryArcFormFieldsProps,
  render: function Render({ form, scripts = [], handleBlur }) {
    const currentStatus = form.getFieldValue('status');

    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField label="Arc Name" placeholder="e.g., Hero's Journey" required onBlur={handleBlur} />
            )}
          </form.AppField>

          <form.AppField name="status">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="status-select">Status</Label>
                <SingleSelect
                  id="status-select"
                  value={field.state.value}
                  onValueChange={(value: string | null) => {
                    field.handleChange((value ?? 'planned') as typeof field.state.value);
                    handleBlur?.();
                  }}
                  options={STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  placeholder="Select status"
                />
              </div>
            )}
          </form.AppField>
        </div>

        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              label="Description"
              placeholder="Describe the narrative arc..."
              rows={4}
              maxLength={1000}
              onBlur={handleBlur}
            />
          )}
        </form.AppField>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.AppField name="startScriptId">
            {(field) => (
              <field.SelectField
                label="Start Script"
                options={[{ value: '', label: 'None' }, ...scripts.map((s) => ({ value: s._id, label: s.title }))]}
                placeholder="Select start script"
                onBlur={handleBlur}
              />
            )}
          </form.AppField>

          <form.AppField name="endScriptId">
            {(field) => (
              <field.SelectField
                label="End Script"
                options={[{ value: '', label: 'None' }, ...scripts.map((s) => ({ value: s._id, label: s.title }))]}
                placeholder="Select end script"
                onBlur={handleBlur}
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="resolution">
          {(field) => (
            <field.TextareaField
              label="Resolution"
              placeholder="How does the arc conclude?"
              rows={3}
              maxLength={1000}
              onBlur={handleBlur}
              disabled={currentStatus !== 'completed'}
              description={currentStatus === 'completed' ? undefined : 'Only available when status is Completed'}
            />
          )}
        </form.AppField>
      </div>
    );
  },
});

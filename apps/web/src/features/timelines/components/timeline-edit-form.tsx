import { EditPanelWrapper } from '@~/components/forms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateTimeline } from '../hooks/mutations/use-update-timeline';
import type { TimelineQueryReturnType } from '../hooks/queries/use-timeline';
import { timelineFormSchema } from '../schemas/timeline.schema';
import { TimelineFormFields } from './timeline-form-fields';

interface iTimelineEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: TimelineQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Unified edit form for timeline entries.
 * Supports both panel mode (auto-save on blur) and dialog mode (manual submit).
 *
 * @param mode - 'panel' for inline panel editing, 'dialog' for modal editing
 * @param initialData - Required timeline data (parent fetches this)
 */
export function TimelineEditForm({ mode, seriesId, initialData, onClose, open, onOpenChange }: iTimelineEditFormProps) {
  const { updateTimeline, isPending } = useUpdateTimeline();

  const form = useAppForm({
    defaultValues: {
      label: initialData.label,
      timestamp: initialData.timestamp ?? '',
    },
    onSubmit: async ({ value }) => {
      updateTimeline(
        {
          id: initialData._id,
          seriesId,
          patch: {
            label: value.label || undefined,
            timestamp: value.timestamp || undefined,
          },
        },
        {
          onSuccess: () => {
            if (mode === EDIT_FORM_MODES.dialog) {
              onOpenChange?.(false);
            }
          },
        },
      );
    },
    validators: {
      onSubmit: timelineFormSchema,
    },
  });

  // Auto-save only enabled in panel mode
  const { handleAutoSave } = useAutoSave(form, {
    isUpdating: isPending,
    enabled: mode === EDIT_FORM_MODES.panel,
  });

  const handleBlur = mode === EDIT_FORM_MODES.panel ? handleAutoSave : undefined;

  // Panel mode content - wrapped in Card for consistent styling
  const panelFormContent = (
    <form.AppForm>
      <form.Form className="p-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Timeline Entry Details</CardTitle>
            <CardDescription>Edit the label and date for this timeline entry</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineFormFields form={form} handleBlur={handleBlur} />
          </CardContent>
        </Card>
      </form.Form>
    </form.AppForm>
  );

  // Dialog mode content - simpler layout with footer actions
  const dialogFormContent = (
    <form.AppForm>
      <form.Form className="space-y-4 p-0">
        <TimelineFormFields form={form} />

        <DialogFooter>
          <form.FormActions
            onCancel={() => onOpenChange?.(false)}
            submitLabel="Update Entry"
            loadingLabel="Updating..."
            isDisabled={isPending}
          />
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );

  // Render based on mode
  if (mode === EDIT_FORM_MODES.panel) {
    return (
      <EditPanelWrapper title="Edit Timeline Entry" onClose={onClose}>
        {panelFormContent}
      </EditPanelWrapper>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Timeline Entry</DialogTitle>
          <DialogDescription>Update the timeline entry details below.</DialogDescription>
        </DialogHeader>
        {dialogFormContent}
      </DialogContent>
    </Dialog>
  );
}

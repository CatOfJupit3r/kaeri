import { useQueries } from '@tanstack/react-query';

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
import { sceneDetailQueryOptions } from '@~/features/scenes/hooks/queries/use-scene';
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
  const linkedSceneIds = (initialData.links ?? [])
    .filter((link) => link.entityType === 'scene')
    .map((link) => link.entityId);
  const linkedSceneQueries = useQueries({
    queries: linkedSceneIds.map((sceneId) => ({
      ...sceneDetailQueryOptions(sceneId),
      enabled: !!sceneId,
    })),
  });
  const isLinkedScenesPending = linkedSceneQueries.some((query) => query.isPending);
  const linkedSceneHeadings = linkedSceneQueries
    .map((query, index) => query.data?.heading ?? `Scene ${linkedSceneIds[index]}`)
    .filter(Boolean);

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

  const linkedScenesContent = (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Linked Scenes</CardTitle>
        <CardDescription>Scenes linked from the script editor scene metadata panel</CardDescription>
      </CardHeader>
      <CardContent>
        {isLinkedScenesPending ? <p className="text-sm text-muted-foreground">Loading linked scenes...</p> : null}
        {!isLinkedScenesPending && linkedSceneHeadings.length > 0 ? (
          <div className="space-y-3">
            {linkedSceneHeadings.map((linkedSceneHeading) => (
              <div key={linkedSceneHeading} className="rounded-md border border-border bg-background/50 p-3">
                <p className="text-sm font-medium text-foreground">{linkedSceneHeading}</p>
              </div>
            ))}
          </div>
        ) : null}
        {!isLinkedScenesPending && linkedSceneHeadings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scenes linked to this timeline entry</p>
        ) : null}
      </CardContent>
    </Card>
  );

  // Panel mode content - wrapped in Card for consistent styling
  const panelFormContent = (
    <form.AppForm>
      <form.Form className="space-y-6 p-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Timeline Entry Details</CardTitle>
            <CardDescription>Edit the label and date for this timeline entry</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineFormFields form={form} handleBlur={handleBlur} />
          </CardContent>
        </Card>
        {linkedScenesContent}
      </form.Form>
    </form.AppForm>
  );

  // Dialog mode content - simpler layout with footer actions
  const dialogFormContent = (
    <form.AppForm>
      <form.Form className="space-y-4 p-0">
        <TimelineFormFields form={form} />
        {linkedScenesContent}

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

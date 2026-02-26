import { useEffect } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Separator } from '@~/components/ui/separator';
import { useAutoSave } from '@~/hooks/use-auto-save';

import { useUpdateTimeline } from '../hooks/mutations/use-update-timeline';
import { useTimeline } from '../hooks/queries/use-timeline';
import { timelineFormSchema } from '../schemas/timeline.schema';

interface iTimelineEditPanelProps {
  timelineId: string;
  seriesId: string;
  onClose: () => void;
}

export function TimelineEditPanel({ timelineId, seriesId, onClose }: iTimelineEditPanelProps) {
  const { data: timeline, isPending: isLoading, error } = useTimeline(timelineId, seriesId);
  const { updateTimeline, isPending: isUpdating } = useUpdateTimeline();

  const form = useAppForm({
    defaultValues: {
      label: '',
      timestamp: '',
    },
    onSubmit: async ({ value }) => {
      if (!timeline) return;

      updateTimeline({
        id: timeline._id,
        seriesId,
        patch: {
          label: value.label || undefined,
          timestamp: value.timestamp || undefined,
        },
      });
    },
    validators: {
      onSubmit: timelineFormSchema,
    },
  });

  const { handleAutoSave, resetInitialization } = useAutoSave(form, { isUpdating });

  // Sync form with timeline data when loaded
  useEffect(() => {
    if (timeline) {
      resetInitialization();
      form.reset({
        label: timeline.label,
        timestamp: timeline.timestamp ?? '',
      });
    }
  }, [timeline, form, resetInitialization]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading timeline entry...</p>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Timeline entry not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-foreground bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <LuArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-lg font-bold">Edit Timeline Entry</h2>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <form.AppForm>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Timeline Entry Details</CardTitle>
                <CardDescription>Edit the label and date for this timeline entry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Label */}
                  <form.AppField name="label">
                    {(field) => (
                      <field.TextField
                        label="Label"
                        placeholder="Enter timeline label"
                        required
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>

                  {/* Timestamp */}
                  <form.AppField name="timestamp">
                    {(field) => (
                      <field.TextField
                        label="Date"
                        placeholder="YYYY-MM-DD"
                        type="date"
                        description="Optional: Provide a date for chronological ordering"
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>
          </form.Form>
        </form.AppForm>
      </ScrollArea>
    </div>
  );
}

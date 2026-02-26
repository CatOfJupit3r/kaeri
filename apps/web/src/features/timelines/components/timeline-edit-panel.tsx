import { useCallback, useEffect, useRef, useState } from 'react';
import { LuArrowLeft, LuCheck, LuLoader } from 'react-icons/lu';
import z from 'zod';

import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Separator } from '@~/components/ui/separator';

import { useUpdateTimeline } from '../hooks/mutations/use-update-timeline';
import { useTimeline } from '../hooks/queries/use-timeline';

interface iTimelineEditPanelProps {
  timelineId: string;
  seriesId: string;
  onClose: () => void;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function TimelineEditPanel({ timelineId, seriesId, onClose }: iTimelineEditPanelProps) {
  const { data: timeline, isPending: isLoading, error } = useTimeline(timelineId, seriesId);
  const { updateTimeline, isPending: isUpdating } = useUpdateTimeline();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  const form = useAppForm({
    defaultValues: {
      label: '',
      timestamp: '',
    },
    onSubmit: async ({ value }) => {
      if (!timeline) return;

      const normalizedLabel = value.label.trim();
      const normalizedTimestamp = value.timestamp.trim();

      updateTimeline(
        {
          id: timeline._id,
          seriesId,
          patch: {
            label: normalizedLabel,
            timestamp: normalizedTimestamp || undefined,
          },
        },
        {
          onSuccess: () => {
            // Stay open on save, form is now synced
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        label: z.string().trim().min(1, 'Label is required').max(200, 'Label must be 200 characters or less'),
        timestamp: z
          .string()
          .trim()
          .refine((val) => !val || DATE_REGEX.test(val), {
            message: 'Use YYYY-MM-DD format',
          }),
      }),
    },
  });

  // Auto-save function
  const handleAutoSave = useCallback(() => {
    if (!isInitializedRef.current) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');
    form.handleSubmit().catch(() => {
      // Handle submit errors silently - the form validators will show errors
    });
  }, [form]);

  // Sync form with timeline data when loaded
  useEffect(() => {
    if (timeline) {
      isInitializedRef.current = false;
      form.reset({
        label: timeline.label,
        timestamp: timeline.timestamp ?? '',
      });
      // Mark as initialized after a short delay to avoid autosave on initial load
      setTimeout(() => {
        isInitializedRef.current = true;
      }, 100);
    }
  }, [timeline, form]);

  // Update save status when mutation completes
  useEffect(() => {
    if (!isUpdating && saveStatus === 'saving') {
      setSaveStatus('saved');
      // Clear saved status after 2 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isUpdating, saveStatus]);

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5">
              <LuLoader className="size-4 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600">
              <LuCheck className="size-4" />
              Saved
            </span>
          )}
          {saveStatus === 'idle' && <span>Auto-save enabled</span>}
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

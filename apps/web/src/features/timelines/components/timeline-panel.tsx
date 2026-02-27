import { PanelError, PanelLoading } from '@~/components/forms';

import { useTimeline } from '../hooks/queries/use-timeline';
import { TimelineEditForm } from './timeline-edit-form';

interface iTimelinePanelProps {
  timelineId: string;
  seriesId: string;
  onClose: () => void;
}

/**
 * Panel wrapper for editing timeline entries.
 * Handles data fetching, loading, and error states.
 * Renders TimelineEditForm in panel mode once data is loaded.
 */
export function TimelinePanel({ timelineId, seriesId, onClose }: iTimelinePanelProps) {
  const { data: timeline, isPending, error } = useTimeline(timelineId, seriesId);

  if (isPending) {
    return <PanelLoading message="Loading timeline entry..." />;
  }

  if (error || !timeline) {
    return <PanelError error={error} message={timeline ? undefined : 'Timeline entry not found'} onClose={onClose} />;
  }

  return <TimelineEditForm mode="panel" seriesId={seriesId} initialData={timeline} onClose={onClose} />;
}

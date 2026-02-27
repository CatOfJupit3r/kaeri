import { PanelError, PanelLoading } from '@~/components/forms';

import { useStoryArc } from '../hooks/queries/use-story-arc';
import { StoryArcEditForm } from './story-arc-edit-form';

interface iStoryArcPanelProps {
  storyArcId: string;
  seriesId: string;
  onClose: () => void;
}

/**
 * Panel wrapper for story arc editing.
 * Fetches the story arc data and renders the edit form in panel mode.
 */
export function StoryArcPanel({ storyArcId, seriesId, onClose }: iStoryArcPanelProps) {
  const { data: storyArc, isPending, error } = useStoryArc(storyArcId);

  if (isPending) {
    return <PanelLoading message="Loading story arc..." />;
  }

  if (error || !storyArc) {
    return <PanelError message={error ? `Error: ${error.message}` : 'Story arc not found'} onClose={onClose} />;
  }

  return <StoryArcEditForm mode="panel" seriesId={seriesId} initialData={storyArc} onClose={onClose} />;
}

import { PanelError, PanelLoading } from '@~/components/forms';

import { useProp } from '../hooks/queries/use-prop';
import { PropEditForm } from './prop-edit-form';

interface iPropPanelProps {
  propId: string;
  seriesId: string;
  onClose: () => void;
}

/**
 * Panel wrapper for prop editing.
 * Fetches the prop data and renders the edit form in panel mode.
 */
export function PropPanel({ propId, seriesId, onClose }: iPropPanelProps) {
  const { data: prop, isPending, error } = useProp(propId, seriesId);

  if (isPending) {
    return <PanelLoading message="Loading prop..." />;
  }

  if (error || !prop) {
    return <PanelError message={error ? `Error: ${error.message}` : 'Prop not found'} onClose={onClose} />;
  }

  return <PropEditForm mode="panel" seriesId={seriesId} initialData={prop} onClose={onClose} />;
}

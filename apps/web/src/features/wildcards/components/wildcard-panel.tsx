import { PanelError, PanelLoading } from '@~/components/forms';

import { useWildcard } from '../hooks/queries/use-wildcard';
import { WildcardEditForm } from './wildcard-edit-form';

interface iWildcardPanelProps {
  wildcardId: string;
  seriesId: string;
  onClose: () => void;
}

/**
 * Panel wrapper for editing wildcards.
 * Handles data fetching, loading, and error states.
 * Renders WildcardEditForm in panel mode once data is loaded.
 */
export function WildcardPanel({ wildcardId, seriesId, onClose }: iWildcardPanelProps) {
  const { data: wildcard, isPending, error } = useWildcard(wildcardId, seriesId);

  if (isPending) {
    return <PanelLoading message="Loading Wild Card..." />;
  }

  if (error || !wildcard) {
    return <PanelError error={error} message={wildcard ? undefined : 'Wild Card not found'} onClose={onClose} />;
  }

  return <WildcardEditForm mode="panel" seriesId={seriesId} initialData={wildcard} onClose={onClose} />;
}

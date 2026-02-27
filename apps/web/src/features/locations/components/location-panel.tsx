import { PanelError, PanelLoading } from '@~/components/forms';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useLocation } from '../hooks/queries/use-location';
import { LocationEditForm } from './location-edit-form';

interface iLocationPanelProps {
  locationId: string;
  seriesId: string;
  onClose: () => void;
}

export function LocationPanel({ locationId, seriesId, onClose }: iLocationPanelProps) {
  const { data: location, isPending, error } = useLocation(locationId, seriesId);

  if (isPending) {
    return <PanelLoading message="Loading location..." />;
  }

  if (error || !location) {
    return <PanelError message={error?.message ?? 'Location not found'} onClose={onClose} />;
  }

  return (
    <LocationEditForm
      key={location._id}
      mode={EDIT_FORM_MODES.panel}
      seriesId={seriesId}
      initialData={location}
      onClose={onClose}
    />
  );
}

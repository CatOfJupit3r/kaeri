import { PanelError, PanelLoading } from '@~/components/forms';

import { useThemeDetail } from '../hooks/queries/use-theme';
import { ThemeEditForm } from './theme-edit-form';

interface iThemePanelProps {
  themeId: string;
  seriesId: string;
  onClose: () => void;
}

/**
 * Panel wrapper for editing themes.
 * Handles data fetching, loading, and error states.
 * Renders ThemeEditForm in panel mode once data is loaded.
 */
export function ThemePanel({ themeId, seriesId, onClose }: iThemePanelProps) {
  const { data: theme, isPending, error } = useThemeDetail(themeId);

  if (isPending) {
    return <PanelLoading message="Loading theme..." />;
  }

  if (error || !theme) {
    return <PanelError error={error} message={theme ? undefined : 'Theme not found'} onClose={onClose} />;
  }

  return <ThemeEditForm mode="panel" seriesId={seriesId} initialData={theme} onClose={onClose} />;
}

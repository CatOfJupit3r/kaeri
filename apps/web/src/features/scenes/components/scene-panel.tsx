import { PanelError, PanelLoading } from '@~/components/forms';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useSceneDetail } from '../hooks/queries/use-scene';
import { SceneEditForm } from './scene-edit-form';

interface iScenePanelProps {
  seriesId: string;
  sceneId: string;
  onClose: () => void;
}

export function ScenePanel({ seriesId, sceneId, onClose }: iScenePanelProps) {
  const { data: scene, isLoading, isError, error } = useSceneDetail(sceneId);

  if (isLoading) {
    return <PanelLoading />;
  }

  if (isError || !scene) {
    return <PanelError error={error} onClose={onClose} />;
  }

  return (
    <SceneEditForm
      key={scene._id}
      mode={EDIT_FORM_MODES.panel}
      seriesId={seriesId}
      initialData={scene}
      onClose={onClose}
    />
  );
}

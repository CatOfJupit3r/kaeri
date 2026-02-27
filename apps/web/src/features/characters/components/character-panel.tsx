import { PanelError, PanelLoading } from '@~/components/forms';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useCharacter } from '../hooks/queries/use-character';
import { CharacterEditForm } from './character-edit-form';

interface iCharacterPanelProps {
  characterId: string;
  seriesId: string;
  onClose: () => void;
}

export function CharacterPanel({ characterId, seriesId, onClose }: iCharacterPanelProps) {
  const { data: character, isPending, error } = useCharacter(characterId, seriesId);

  if (isPending) {
    return <PanelLoading message="Loading character..." />;
  }

  if (error || !character) {
    return <PanelError message={error?.message ?? 'Character not found'} onClose={onClose} />;
  }

  return (
    <CharacterEditForm
      key={character._id}
      mode={EDIT_FORM_MODES.panel}
      seriesId={seriesId}
      initialData={character}
      onClose={onClose}
    />
  );
}

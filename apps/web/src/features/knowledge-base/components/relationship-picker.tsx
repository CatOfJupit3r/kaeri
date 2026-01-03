import { useState } from 'react';
import { LuX } from 'react-icons/lu';

import { RELATIONSHIP_TYPES } from '@kaeri/shared/enums/kaeri.enums';

import { Button } from '@~/components/ui/button';
import { Label } from '@~/components/ui/label';
import type { iOptionType } from '@~/components/ui/select';
import { SingleSelect } from '@~/components/ui/select';
import { Textarea } from '@~/components/ui/textarea';
import type { CharacterListItem } from '@~/features/characters/hooks/queries/use-character-list';

type Relationship = NonNullable<CharacterListItem['relationships']>[number];
type RelationshipType = Relationship['type'];

interface iCharacterOption {
  _id: string;
  name: string;
}

interface iRelationshipPickerProps {
  characters: iCharacterOption[];
  currentCharacterId?: string;
  relationships: Relationship[];
  onAdd: (relationship: Relationship) => void;
  onRemove: (targetId: string) => void;
  disabled?: boolean;
}

const relationshipTypeOptions: iOptionType[] = (Object.values(RELATIONSHIP_TYPES) as RelationshipType[]).map(
  (type) => ({
    label: type,
    value: type,
  }),
);

export function RelationshipPicker({
  characters,
  currentCharacterId,
  relationships,
  onAdd,
  onRemove,
  disabled = false,
}: iRelationshipPickerProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<RelationshipType | null>(null);
  const [note, setNote] = useState('');

  const availableCharacters = characters.filter((char) => char._id !== currentCharacterId);

  const characterOptions: iOptionType[] = availableCharacters.map((char) => ({
    label: char.name,
    value: char._id,
  }));

  const getCharacterName = (targetId: string) => {
    const character = characters.find((char) => char._id === targetId);
    return character?.name ?? 'Unknown';
  };

  const handleAddRelationship = () => {
    if (!selectedTargetId || !selectedType) return;

    const newRelationship: Relationship = {
      targetId: selectedTargetId,
      type: selectedType,
      note: note.trim() || undefined,
    };

    onAdd(newRelationship);

    setSelectedTargetId(null);
    setSelectedType(null);
    setNote('');
  };

  const handleRemoveRelationship = (targetId: string) => {
    onRemove(targetId);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="character-select">Character</Label>
          <SingleSelect
            inputId="character-select"
            options={characterOptions}
            value={selectedTargetId}
            onValueChange={setSelectedTargetId}
            placeholder="Select a character..."
            isDisabled={disabled || availableCharacters.length === 0}
            isClearable
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship-type-select">Relationship Type</Label>
          <SingleSelect
            inputId="relationship-type-select"
            options={relationshipTypeOptions}
            value={selectedType}
            onValueChange={setSelectedType}
            placeholder="Select relationship type..."
            isDisabled={disabled}
            isClearable
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship-note">Note (optional)</Label>
          <Textarea
            id="relationship-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this relationship..."
            rows={2}
            disabled={disabled}
            maxLength={200}
          />
        </div>

        <Button
          type="button"
          onClick={handleAddRelationship}
          disabled={!selectedTargetId || !selectedType || disabled}
          size="sm"
          className="w-full"
        >
          Add Relationship
        </Button>
      </div>

      {relationships.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="current-relationships">Current Relationships</Label>
          <div id="current-relationships" className="space-y-2">
            {relationships.map((rel: Relationship) => (
              <div key={rel.targetId} className="flex items-start justify-between rounded-md border border-border p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getCharacterName(rel.targetId)}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{rel.type}</span>
                  </div>
                  {rel.note ? <p className="mt-1 text-sm text-muted-foreground">{rel.note}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRelationship(rel.targetId)}
                  className="ml-2 rounded-full p-1 hover:bg-muted"
                  disabled={disabled}
                  aria-label="Remove relationship"
                >
                  <LuX className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { Badge } from '@~/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@~/components/ui/hover-card';
import { useCharacter } from '@~/features/characters/hooks/queries/use-character';

interface iCharacterHoverPreviewProps {
  characterId: string;
  seriesId: string;
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function CharacterHoverPreview({ characterId, seriesId, children, onOpenChange }: iCharacterHoverPreviewProps) {
  const { data: character, isLoading } = useCharacter(characterId, seriesId);

  const initials = character?.name
    ? character.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  const renderDescription = () => {
    if (!character?.description) {
      return <p className="text-xs text-muted-foreground italic">No description</p>;
    }
    return <p className="text-xs text-muted-foreground">{truncateText(character.description, 120)}</p>;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      );
    }

    if (!character) {
      return (
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-muted-foreground">Character not found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            {character.avatarUrl ? <AvatarImage src={character.avatarUrl} alt={character.name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold">{character.name}</h4>
            {renderDescription()}
          </div>
        </div>
        {character.traits && character.traits.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {character.traits.length} trait{character.traits.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-1">
              {character.traits.slice(0, 5).map((trait) => (
                <Badge key={trait} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
              {character.traits.length > 5 ? (
                <Badge variant="outline" className="text-xs">
                  +{character.traits.length - 5} more
                </Badge>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <HoverCard openDelay={300} closeDelay={100} onOpenChange={onOpenChange}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80" side="right">
        {renderContent()}
      </HoverCardContent>
    </HoverCard>
  );
}

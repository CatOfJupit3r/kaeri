import { Link } from '@tanstack/react-router';
import { LuUser } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { Skeleton } from '@~/components/ui/skeleton';
import { useCharacterDetail } from '@~/features/characters/hooks/queries/use-character-detail';

interface iThemeCharacterLinkProps {
  themeId: string;
  characterId: string;
  connection: string;
  seriesId: string;
}

export function ThemeCharacterLink({ themeId: _themeId, characterId, connection, seriesId }: iThemeCharacterLinkProps) {
  const { data: character, isPending } = useCharacterDetail(characterId, seriesId);

  if (isPending) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border p-3 text-muted-foreground">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <LuUser className="size-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Unknown character</p>
          <p className="text-xs">{connection}</p>
        </div>
      </div>
    );
  }

  const initials = character.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      to="/series/$seriesId/knowledge-base/characters/$characterId"
      params={{ seriesId, characterId }}
      search={{ tab: 'characters' }}
      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-accent"
    >
      <Avatar className="size-10">
        {character.avatarUrl ? <AvatarImage src={character.avatarUrl} alt={character.name} /> : null}
        <AvatarFallback className="text-sm">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{character.name}</p>
        <p className="text-xs text-muted-foreground">{connection}</p>
      </div>
    </Link>
  );
}

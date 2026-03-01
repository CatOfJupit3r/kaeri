import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { LuTag, LuUsers, LuFileText } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { Skeleton } from '@~/components/ui/skeleton';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export interface iCharacterPreviewProps {
  /** Character entity ID */
  entityId: string;
  /** Series ID for data fetching */
  seriesId: string;
}

/**
 * Character Preview Component
 */
export const CharacterPreview = memo(({ entityId, seriesId }: iCharacterPreviewProps) => {
  const { data: character, isLoading } = useQuery({
    ...tanstackRPC.knowledgeBase.characters.get.queryOptions({
      input: { id: entityId, seriesId },
    }),
    enabled: !!entityId && !!seriesId,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    );
  }

  if (!character) {
    return <div className="p-4 text-sm text-muted-foreground">Character not found</div>;
  }

  // Get first 3 traits
  const traits = character.traits?.slice(0, 3) ?? [];
  const appearanceCount = character.appearances?.length ?? 0;
  const relationshipCount = character.relationships?.length ?? 0;

  return (
    <div className="p-4">
      {/* Header with avatar and name */}
      <div className="flex items-start gap-3">
        <Avatar className="size-12">
          {character.avatarUrl ? <AvatarImage src={character.avatarUrl} alt={character.name} /> : null}
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {character.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{character.name}</h3>
          <p className="truncate text-sm text-muted-foreground">Character</p>
        </div>
      </div>

      {/* Description */}
      {character.description ? <p className="mt-3 line-clamp-2 text-sm">{character.description}</p> : null}

      {/* Traits and stats */}
      <div className="mt-3 space-y-1.5 text-sm">
        {traits.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <LuTag className="size-4" />
            <span className="truncate">{traits.join(', ')}</span>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <LuUsers className="size-4" />
            <span>{relationshipCount} relationships</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <LuFileText className="size-4" />
            <span>{appearanceCount} appearances</span>
          </div>
        </div>
      </div>
    </div>
  );
});

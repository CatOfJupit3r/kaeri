import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export function useCharacter(characterId: string, seriesId: string) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.characters.get.queryOptions({
      input: { id: characterId, seriesId },
    }),
    enabled: !!characterId && !!seriesId,
  });
}

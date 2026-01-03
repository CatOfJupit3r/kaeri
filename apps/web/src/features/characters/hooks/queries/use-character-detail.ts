import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type CharacterDetailQueryReturnType = ORPCOutputs['knowledgeBase']['characters']['get'];

export function useCharacterDetail(characterId: string, seriesId: string) {
  return useQuery({
    ...tanstackRPC.knowledgeBase.characters.get.queryOptions({
      input: { id: characterId, seriesId },
    }),
    enabled: !!characterId && !!seriesId,
  });
}

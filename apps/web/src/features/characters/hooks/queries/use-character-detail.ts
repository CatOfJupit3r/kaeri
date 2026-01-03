import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type CharacterDetailQueryReturnType = ORPCOutputs['knowledgeBase']['characters']['get'];

export const characterDetailQueryOptions = (characterId: string, seriesId: string) =>
  tanstackRPC.knowledgeBase.characters.get.queryOptions({
    input: { id: characterId, seriesId },
  });

export function useCharacterDetail(characterId: string, seriesId: string, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...characterDetailQueryOptions(characterId, seriesId),
    enabled: (params.enabled ?? true) && !!characterId && !!seriesId,
  });
}

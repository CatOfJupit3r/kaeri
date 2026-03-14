import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const episodeQueryOptions = (episodeId: string) =>
  tanstackRPC.episode.getEpisode.queryOptions({
    input: { episodeId },
  });

export function useEpisode(episodeId: string) {
  return useQuery(episodeQueryOptions(episodeId));
}

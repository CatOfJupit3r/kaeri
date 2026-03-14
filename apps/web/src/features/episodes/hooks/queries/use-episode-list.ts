import { useQuery } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const episodeListQueryOptions = (seriesId: string, seasonNumber?: number) =>
  tanstackRPC.episode.listEpisodesBySeries.queryOptions({
    input: { seriesId, seasonNumber },
  });

export function useEpisodeList(seriesId: string, seasonNumber?: number) {
  return useQuery(episodeListQueryOptions(seriesId, seasonNumber));
}

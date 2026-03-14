import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createEpisodeMutationOptions = tanstackRPC.episode.createEpisode.mutationOptions({
  onSuccess: async (data, _variables, _context, ctx) => {
    toastSuccess(`Episode created: S${data.seasonNumber}E${data.episodeNumber}`);
    await ctx.client.invalidateQueries({ queryKey: ['episodes', 'list', data.seriesId] });
  },
  onError: (error) => {
    toastORPCError('Failed to create episode', error);
  },
});

export function useCreateEpisode() {
  const mutation = useMutation(createEpisodeMutationOptions);

  return {
    createEpisode: mutation.mutate,
    createEpisodeAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

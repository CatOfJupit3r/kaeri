import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const updateEpisodeMutationOptions = tanstackRPC.episode.updateEpisode.mutationOptions({
  onSuccess: async (data, _variables, _context, ctx) => {
    toastSuccess('Episode updated');
    await ctx.client.invalidateQueries({ queryKey: ['episodes', 'detail', data._id] });
    await ctx.client.invalidateQueries({ queryKey: ['episodes', 'list', data.seriesId] });
  },
  onError: (error) => {
    toastORPCError('Failed to update episode', error);
  },
});

export function useUpdateEpisode() {
  const mutation = useMutation(updateEpisodeMutationOptions);

  return {
    updateEpisode: mutation.mutate,
    updateEpisodeAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

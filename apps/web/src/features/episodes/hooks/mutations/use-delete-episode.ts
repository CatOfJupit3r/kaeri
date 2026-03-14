import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const deleteEpisodeMutationOptions = tanstackRPC.episode.deleteEpisode.mutationOptions({
  onSuccess: async (_data, _variables, _context, ctx) => {
    toastSuccess('Episode deleted');
    await ctx.client.invalidateQueries({ queryKey: ['episodes'] });
  },
  onError: (error) => {
    toastORPCError('Failed to delete episode', error);
  },
});

export function useDeleteEpisode() {
  const mutation = useMutation(deleteEpisodeMutationOptions);

  return {
    deleteEpisode: mutation.mutate,
    deleteEpisodeAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

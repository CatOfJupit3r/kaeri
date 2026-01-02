import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createWildcardMutationOptions = tanstackRPC.knowledgeBase.wildcards.create.mutationOptions({
  onMutate: async ({ seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.wildcards.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.wildcards.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });
    toastSuccess('Wild Card created successfully');
  },
  onError: (error) => {
    toastORPCError('Failed to create Wild Card', error);
  },
});

export function useCreateWildcard() {
  const { mutate: createWildcard, isPending } = useMutation(createWildcardMutationOptions);

  return {
    createWildcard,
    isPending,
  };
}

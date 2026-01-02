import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createCharacterMutationOptions = tanstackRPC.knowledgeBase.characters.create.mutationOptions({
  onMutate: async ({ seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });
    toastSuccess('Character created successfully');
  },
  onError: (error) => {
    toastORPCError('Failed to create character', error);
  },
});

export function useCreateCharacter() {
  const { mutate: createCharacter, isPending } = useMutation(createCharacterMutationOptions);

  return {
    createCharacter,
    isPending,
  };
}

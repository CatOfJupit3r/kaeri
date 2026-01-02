import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type CharacterListQueryReturnType = ORPCOutputs['knowledgeBase']['characters']['list'];

export const deleteCharacterMutationOptions = tanstackRPC.knowledgeBase.characters.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<CharacterListQueryReturnType>(queryKey);

    ctx.client.setQueryData<CharacterListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.filter((character) => character._id !== id),
        total: oldData.total - 1,
      };
    });

    return { previousData };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    if (context?.previousData) {
      ctx.client.setQueryData<CharacterListQueryReturnType>(queryKey, context.previousData);
    } else {
      void ctx.client.invalidateQueries({ queryKey });
    }

    toastORPCError('Failed to delete character', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });

    toastSuccess('Character deleted successfully');
  },
});

export function useDeleteCharacter() {
  const { mutate: deleteCharacter, isPending } = useMutation(deleteCharacterMutationOptions);

  return {
    deleteCharacter,
    isPending,
  };
}

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { KB_LIST_DEFAULT_PARAMS, invalidateKnowledgeBaseLists } from '../../../knowledge-base/helpers/cache-utils';

export type CharacterListQueryReturnType = ORPCOutputs['knowledgeBase']['characters']['list'];

export const deleteCharacterMutationOptions = tanstackRPC.knowledgeBase.characters.remove.mutationOptions({
  onMutate: async ({ id, seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<CharacterListQueryReturnType>(queryKey);

    ctx.client.setQueryData<CharacterListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const filteredItems = oldData.items.filter((character) => character._id !== id);
      const isRemoved = filteredItems.length !== oldData.items.length;

      return {
        ...oldData,
        items: filteredItems,
        total: isRemoved ? Math.max(0, oldData.total - 1) : oldData.total,
      };
    });

    return { previousData };
  },
  onError: (error, { seriesId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    void ctx.client.invalidateQueries({ queryKey });

    toastORPCError('Failed to delete character', error);
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void invalidateKnowledgeBaseLists(ctx.client, 'characters', seriesId);

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

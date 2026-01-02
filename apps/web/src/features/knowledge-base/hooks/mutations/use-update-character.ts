import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type CharacterListQueryReturnType = ORPCOutputs['knowledgeBase']['characters']['list'];

export const updateCharacterMutationOptions = tanstackRPC.knowledgeBase.characters.update.mutationOptions({
  onMutate: async ({ id, seriesId, patch }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });

    const previousData = ctx.client.getQueryData<CharacterListQueryReturnType>(queryKey);

    ctx.client.setQueryData<CharacterListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((character) => (character._id === id ? { ...character, ...patch } : character)),
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

    toastORPCError('Failed to update character', error);
  },
  onSuccess: (updatedCharacter, { seriesId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    ctx.client.setQueryData<CharacterListQueryReturnType>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.map((character) =>
          character._id === updatedCharacter._id ? updatedCharacter : character,
        ),
      };
    });

    toastSuccess('Character updated successfully');
  },
});

export function useUpdateCharacter() {
  const { mutate: updateCharacter, isPending } = useMutation(updateCharacterMutationOptions);

  return {
    updateCharacter,
    isPending,
  };
}

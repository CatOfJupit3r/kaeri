import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

type CharacterType = ORPCOutputs['knowledgeBase']['characters']['get'];

export const removeAppearanceMutationOptions = tanstackRPC.knowledgeBase.removeAppearance.mutationOptions({
  onMutate: async ({ seriesId, characterId, scriptId, sceneRef }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    await ctx.client.cancelQueries({ queryKey });
    const previous = ctx.client.getQueryData<CharacterType>(queryKey);

    ctx.client.setQueryData<CharacterType>(queryKey, (oldData: CharacterType | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        appearances: (oldData.appearances ?? []).filter((a) => !(a.scriptId === scriptId && a.sceneRef === sceneRef)),
      };
    });

    return { previous };
  },
  onError: (error, { seriesId, characterId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    void ctx.client.invalidateQueries({ queryKey });

    toastORPCError('Failed to remove appearance', error);
  },
  onSuccess: (data, { seriesId, characterId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    ctx.client.setQueryData<CharacterType>(queryKey, data);
    toastSuccess('Appearance removed successfully');
  },
});

export function useRemoveAppearance() {
  const { mutate: removeAppearance, isPending } = useMutation(removeAppearanceMutationOptions);

  return {
    removeAppearance,
    isPending,
  };
}

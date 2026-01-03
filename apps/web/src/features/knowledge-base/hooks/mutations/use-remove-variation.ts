import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

type CharacterType = ORPCOutputs['knowledgeBase']['characters']['get'];

export const removeVariationMutationOptions = tanstackRPC.knowledgeBase.removeVariation.mutationOptions({
  onMutate: async ({ seriesId, characterId, scriptId, label }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    await ctx.client.cancelQueries({ queryKey });
    const previous = ctx.client.getQueryData<CharacterType>(queryKey);

    ctx.client.setQueryData<CharacterType>(queryKey, (oldData: CharacterType | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        variations: (oldData.variations ?? []).filter(
          (v: { scriptId: string; label: string }) => !(v.scriptId === scriptId && (!label || v.label === label)),
        ),
      };
    });

    return { previous };
  },
  onError: (error, { seriesId, characterId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    void ctx.client.invalidateQueries({ queryKey });

    toastORPCError('Failed to remove variation', error);
  },
  onSuccess: (data, { seriesId, characterId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    ctx.client.setQueryData<CharacterType>(queryKey, data);
    toastSuccess('Variation removed successfully');
  },
});

export function useRemoveVariation() {
  const { mutate: removeVariation, isPending } = useMutation(removeVariationMutationOptions);

  return {
    removeVariation,
    isPending,
  };
}

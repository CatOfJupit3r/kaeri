import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

type CharacterType = ORPCOutputs['knowledgeBase']['characters']['get'];

export const addVariationMutationOptions = tanstackRPC.knowledgeBase.addVariation.mutationOptions({
  onMutate: async ({ seriesId, characterId, variation }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    await ctx.client.cancelQueries({ queryKey });
    const previous = ctx.client.getQueryData<CharacterType>(queryKey);

    ctx.client.setQueryData<CharacterType>(queryKey, (oldData: CharacterType | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        variations: [...(oldData.variations ?? []), variation],
      };
    });

    return { previous };
  },
  onError: (error, { seriesId, characterId }, context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    if (context?.previous) {
      ctx.client.setQueryData<CharacterType>(queryKey, context.previous);
    } else {
      void ctx.client.invalidateQueries({ queryKey });
    }

    toastORPCError('Failed to add variation', error);
  },
  onSuccess: (data, { seriesId, characterId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    ctx.client.setQueryData<CharacterType>(queryKey, data);
    toastSuccess('Variation added successfully');
  },
});

export function useAddVariation() {
  const { mutate: addVariation, isPending } = useMutation(addVariationMutationOptions);

  return {
    addVariation,
    isPending,
  };
}

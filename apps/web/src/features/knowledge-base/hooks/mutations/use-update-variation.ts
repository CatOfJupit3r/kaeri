import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

type CharacterType = ORPCOutputs['knowledgeBase']['characters']['get'];

export const updateVariationMutationOptions = tanstackRPC.knowledgeBase.updateVariation.mutationOptions({
  onMutate: async ({ seriesId, characterId, scriptId, label, patch }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    await ctx.client.cancelQueries({ queryKey });
    const previous = ctx.client.getQueryData<CharacterType>(queryKey);

    ctx.client.setQueryData<CharacterType>(queryKey, (oldData: CharacterType | undefined) => {
      if (!oldData) return oldData;

      const variations = [...(oldData.variations ?? [])];
      const index = variations.findIndex((v) => v.scriptId === scriptId && v.label === label);

      if (index !== -1) {
        variations[index] = {
          ...variations[index],
          ...(patch.label !== undefined && { label: patch.label }),
          ...(patch.notes !== undefined && { notes: patch.notes }),
        };
      }

      return {
        ...oldData,
        variations,
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

    toastORPCError('Failed to update variation', error);
  },
  onSuccess: (data, { seriesId, characterId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    ctx.client.setQueryData<CharacterType>(queryKey, data);
    toastSuccess('Variation updated successfully');
  },
});

export function useUpdateVariation() {
  const { mutate: updateVariation, isPending } = useMutation(updateVariationMutationOptions);

  return {
    updateVariation,
    isPending,
  };
}

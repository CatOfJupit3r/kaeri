import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

type CharacterType = ORPCOutputs['knowledgeBase']['characters']['get'];

export const addAppearanceMutationOptions = tanstackRPC.knowledgeBase.addAppearance.mutationOptions({
  onMutate: async ({ seriesId, characterId, appearance }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    await ctx.client.cancelQueries({ queryKey });
    const previous = ctx.client.getQueryData<CharacterType>(queryKey);

    ctx.client.setQueryData<CharacterType>(queryKey, (oldData: CharacterType | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        appearances: [...(oldData.appearances ?? []), appearance],
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

    toastORPCError('Failed to add appearance', error);
  },
  onSuccess: (data, { seriesId, characterId }, _context, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.get.queryKey({ input: { id: characterId, seriesId } });

    ctx.client.setQueryData<CharacterType>(queryKey, data);
    toastSuccess('Appearance added successfully');
  },
});

export function useAddAppearance() {
  const { mutate: addAppearance, isPending } = useMutation(addAppearanceMutationOptions);

  return {
    addAppearance,
    isPending,
  };
}

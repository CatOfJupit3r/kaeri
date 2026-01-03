import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';
import type { CharacterListQueryReturnType, CharacterListItem } from '../queries/use-character-list';

export const createCharacterMutationOptions = tanstackRPC.knowledgeBase.characters.create.mutationOptions({
  onMutate: async ({ seriesId, value }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.characters.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<CharacterListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticCharacter: CharacterListItem = {
      _id: tempId,
      seriesId,
      name: value.name as CharacterListItem['name'],
      description: value.description as CharacterListItem['description'],
      avatarUrl: value.avatarUrl as CharacterListItem['avatarUrl'],
      traits: (value.traits ?? []) as CharacterListItem['traits'],
      relationships: (value.relationships ?? []) as CharacterListItem['relationships'],
      appearances: (value.appearances ?? []) as CharacterListItem['appearances'],
    };

    ctx.client.setQueryData<CharacterListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticCharacter],
          total: 1,
        } satisfies CharacterListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticCharacter, ...old.items],
        total: old.total + 1,
      } satisfies CharacterListQueryReturnType;
    });

    return { previous, tempId, queryKey };
  },
  onSuccess: (createdCharacter, { seriesId }, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<CharacterListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [createdCharacter, ...withoutTemp],
        } satisfies CharacterListQueryReturnType;
      });
    }

    void invalidateKnowledgeBaseLists(ctx.client, 'characters', seriesId);
    toastSuccess('Character created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
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

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';
import type { PropListQueryReturnType } from '../queries/use-prop-list';

type PropListItem = PropListQueryReturnType['items'][number];

export const createPropMutationOptions = tanstackRPC.knowledgeBase.props.create.mutationOptions({
  onMutate: async ({ seriesId, value }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<PropListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticProp: PropListItem = {
      _id: tempId,
      seriesId,
      name: value.name as PropListItem['name'],
      description: value.description as PropListItem['description'],
      associations: (value.associations ?? []) as PropListItem['associations'],
    };

    ctx.client.setQueryData<PropListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticProp],
          total: 1,
        } satisfies PropListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticProp, ...old.items],
        total: old.total + 1,
      } satisfies PropListQueryReturnType;
    });

    return { previous, tempId, queryKey };
  },
  onSuccess: (createdProp, { seriesId }, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<PropListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [createdProp, ...withoutTemp],
        } satisfies PropListQueryReturnType;
      });
    }

    void invalidateKnowledgeBaseLists(ctx.client, 'props', seriesId);
    toastSuccess('Prop created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
    toastORPCError('Failed to create prop', error);
  },
});

export function useCreateProp() {
  const { mutate: createProp, isPending } = useMutation(createPropMutationOptions);

  return {
    createProp,
    isPending,
  };
}

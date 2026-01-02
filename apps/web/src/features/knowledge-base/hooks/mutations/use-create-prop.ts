import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createPropMutationOptions = tanstackRPC.knowledgeBase.props.create.mutationOptions({
  onMutate: async ({ seriesId }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } });

    await ctx.client.cancelQueries({ queryKey });
  },
  onSuccess: (_data, { seriesId }, _context, ctx) => {
    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId, limit: 20, offset: 0 } }),
    });
    toastSuccess('Prop created successfully');
  },
  onError: (error) => {
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

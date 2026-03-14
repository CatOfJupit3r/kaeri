import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ResearchQueryReturnType } from '../queries/use-research';

export const updateResearchMutationOptions = tanstackRPC.research.update.mutationOptions({
  onMutate: async ({ researchId: researchIdInput, patch }, ctx) => {
    const detailQueryKey = tanstackRPC.research.get.queryKey({ input: { researchId: researchIdInput } });
    await ctx.client.cancelQueries({ queryKey: detailQueryKey });

    const previousDetail = ctx.client.getQueryData<ResearchQueryReturnType>(detailQueryKey);

    ctx.client.setQueryData<ResearchQueryReturnType>(detailQueryKey, (old) => {
      if (!old) return old;
      return { ...old, ...patch };
    });

    return { previousDetail, detailQueryKey };
  },
  onSuccess: (updatedResearch, _variables, context, ctx) => {
    if (context?.detailQueryKey) {
      ctx.client.setQueryData<ResearchQueryReturnType>(context.detailQueryKey, updatedResearch);
    }

    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.research.list.queryKey({ input: { seriesId: updatedResearch.seriesId } }),
    });

    toastSuccess('Research entry updated');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.detailQueryKey && context?.previousDetail) {
      ctx.client.setQueryData<ResearchQueryReturnType>(context.detailQueryKey, context.previousDetail);
    }
    toastORPCError('Failed to update research entry', error);
  },
});

export function useUpdateResearch() {
  return useMutation(updateResearchMutationOptions);
}

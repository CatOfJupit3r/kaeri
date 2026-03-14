import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ResearchListQueryReturnType } from '../queries/use-research-list';

export const deleteResearchMutationOptions = tanstackRPC.research.delete.mutationOptions({
  onMutate: async ({ researchId }, ctx) => {
    const listQueries = ctx.client
      .getQueryCache()
      .findAll()
      .filter((query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) && JSON.stringify(key).includes('"research"') && JSON.stringify(key).includes('"list"')
        );
      });

    await Promise.all(listQueries.map(async (query) => ctx.client.cancelQueries({ queryKey: query.queryKey })));

    const previousData = new Map<readonly unknown[], ResearchListQueryReturnType>();
    listQueries.forEach((query) => {
      const data = ctx.client.getQueryData<ResearchListQueryReturnType>(query.queryKey);
      if (data) {
        previousData.set(query.queryKey, data);
        ctx.client.setQueryData<ResearchListQueryReturnType>(query.queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item._id !== researchId),
            total: old.total - 1,
          };
        });
      }
    });

    return { previousData, listQueries };
  },
  onSuccess: (_result, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && JSON.stringify(key).includes('"research"');
      },
    });

    toastSuccess('Research entry deleted');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.previousData && context?.listQueries) {
      context.listQueries.forEach((query) => {
        const prevData = context.previousData.get(query.queryKey);
        if (prevData) {
          ctx.client.setQueryData<ResearchListQueryReturnType>(query.queryKey, prevData);
        }
      });
    }

    toastORPCError('Failed to delete research entry', error);
  },
});

export function useDeleteResearch() {
  return useMutation(deleteResearchMutationOptions);
}

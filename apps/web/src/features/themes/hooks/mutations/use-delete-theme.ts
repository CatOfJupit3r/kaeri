import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ThemeListQueryReturnType } from '../queries/use-theme-list';

export const deleteThemeMutationOptions = tanstackRPC.theme.deleteTheme.mutationOptions({
  onMutate: async ({ themeId }, ctx) => {
    const listQueries = ctx.client
      .getQueryCache()
      .findAll()
      .filter((query) => {
        const key = query.queryKey;
        return Array.isArray(key) && JSON.stringify(key).includes('"listThemes"');
      });

    await Promise.all(listQueries.map(async (query) => ctx.client.cancelQueries({ queryKey: query.queryKey })));

    const previousData = new Map();
    listQueries.forEach((query) => {
      const data = ctx.client.getQueryData<ThemeListQueryReturnType>(query.queryKey);
      if (data) {
        previousData.set(query.queryKey, data);
        ctx.client.setQueryData<ThemeListQueryReturnType>(query.queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item._id !== themeId),
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
        return Array.isArray(key) && JSON.stringify(key).includes('"theme"');
      },
    });

    toastSuccess('Theme deleted successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.previousData && context?.listQueries) {
      context.listQueries.forEach((query) => {
        const prevData = context.previousData.get(query.queryKey);
        if (prevData) {
          ctx.client.setQueryData<ThemeListQueryReturnType>(query.queryKey, prevData);
        }
      });
    }
    toastORPCError('Failed to delete theme', error);
  },
});

export function useDeleteTheme() {
  const { mutate: deleteTheme, isPending } = useMutation(deleteThemeMutationOptions);

  return {
    deleteTheme,
    isPending,
  };
}

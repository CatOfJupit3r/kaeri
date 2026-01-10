import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ThemeDetailQueryReturnType } from '../queries/use-theme-detail';

export const updateThemeMutationOptions = tanstackRPC.theme.updateTheme.mutationOptions({
  onMutate: async ({ themeId, patch }, ctx) => {
    const detailQueryKey = tanstackRPC.theme.getTheme.queryKey({ input: { themeId } });
    await ctx.client.cancelQueries({ queryKey: detailQueryKey });

    const previousDetail = ctx.client.getQueryData<ThemeDetailQueryReturnType>(detailQueryKey);

    ctx.client.setQueryData<ThemeDetailQueryReturnType>(detailQueryKey, (old) => {
      if (!old) return old;
      return { ...old, ...patch };
    });

    return { previousDetail, detailQueryKey };
  },
  onSuccess: (updatedTheme, { themeId }, context, ctx) => {
    if (context?.detailQueryKey) {
      ctx.client.setQueryData<ThemeDetailQueryReturnType>(context.detailQueryKey, updatedTheme);
    }

    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.theme.listThemesBySeries.queryKey({ input: { seriesId: updatedTheme.seriesId } }),
    });

    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && JSON.stringify(key).includes('"theme"') && JSON.stringify(key).includes(themeId);
      },
    });

    toastSuccess('Theme updated successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.detailQueryKey && context?.previousDetail) {
      ctx.client.setQueryData<ThemeDetailQueryReturnType>(context.detailQueryKey, context.previousDetail);
    }
    toastORPCError('Failed to update theme', error);
  },
});

export function useUpdateTheme() {
  const { mutate: updateTheme, isPending } = useMutation(updateThemeMutationOptions);

  return {
    updateTheme,
    isPending,
  };
}

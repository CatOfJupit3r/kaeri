import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ThemeListItem, ThemeListQueryReturnType } from '../queries/use-theme-list';

export const createThemeMutationOptions = tanstackRPC.theme.createTheme.mutationOptions({
  onMutate: async ({ seriesId, value }, ctx) => {
    const queryKey = tanstackRPC.theme.listThemesBySeries.queryKey({
      input: { seriesId, limit: 20, offset: 0 },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<ThemeListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticTheme: ThemeListItem = {
      _id: tempId,
      seriesId,
      name: value.name,
      description: value.description,
      color: value.color,
      visualMotifs: value.visualMotifs ?? [],
      relatedCharacters: value.relatedCharacters ?? [],
      evolution: value.evolution ?? [],
      appearances: value.appearances ?? [],
    };

    ctx.client.setQueryData<ThemeListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticTheme],
          total: 1,
        } satisfies ThemeListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticTheme, ...old.items],
        total: old.total + 1,
      } satisfies ThemeListQueryReturnType;
    });

    return { previous, tempId, queryKey };
  },
  onSuccess: (createdTheme, { seriesId }, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<ThemeListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [createdTheme, ...withoutTemp],
        } satisfies ThemeListQueryReturnType;
      });
    }

    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.theme.listThemesBySeries.queryKey({ input: { seriesId } }),
    });
    toastSuccess('Theme created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
    toastORPCError('Failed to create theme', error);
  },
});

export function useCreateTheme() {
  const { mutate: createTheme, isPending } = useMutation(createThemeMutationOptions);

  return {
    createTheme,
    isPending,
  };
}

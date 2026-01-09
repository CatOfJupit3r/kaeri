import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { SceneListQueryReturnType } from '../queries/use-scene-list';

export const deleteSceneMutationOptions = tanstackRPC.scene.deleteScene.mutationOptions({
  onMutate: async ({ sceneId }, ctx) => {
    const allListQueries = ctx.client
      .getQueryCache()
      .getAll()
      .filter(
        (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === 'scene' && query.queryKey[1] === 'listScenesByScript',
      );

    const previous: Array<{ queryKey: unknown; data: unknown }> = [];

    await Promise.all(
      allListQueries.map(async (query) => {
        await ctx.client.cancelQueries({ queryKey: query.queryKey });
        const data = ctx.client.getQueryData(query.queryKey);
        previous.push({ queryKey: query.queryKey, data });

        ctx.client.setQueryData<SceneListQueryReturnType>(query.queryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.filter((item) => item._id !== sceneId),
            total: old.total - 1,
          } satisfies SceneListQueryReturnType;
        });
      }),
    );

    return { previous };
  },
  onSuccess: (_data, _variables, _context, ctx) => {
    const allListQueries = ctx.client
      .getQueryCache()
      .getAll()
      .filter(
        (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === 'scene' && query.queryKey[1] === 'listScenesByScript',
      );

    for (const query of allListQueries) {
      void ctx.client.invalidateQueries({ queryKey: query.queryKey });
    }
    toastSuccess('Scene deleted successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.previous) {
      for (const { queryKey, data } of context.previous) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctx.client.setQueryData(queryKey as any, data);
      }
    } else {
      const allListQueries = ctx.client
        .getQueryCache()
        .getAll()
        .filter(
          (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'scene' &&
            query.queryKey[1] === 'listScenesByScript',
        );

      for (const query of allListQueries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        void ctx.client.invalidateQueries({ queryKey: query.queryKey as any });
      }
    }
    toastORPCError('Failed to delete scene', error);
  },
});

export function useDeleteScene() {
  const { mutate: deleteScene, isPending } = useMutation(deleteSceneMutationOptions);

  return {
    deleteScene,
    isPending,
  };
}

import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { SceneListQueryReturnType, SceneListItem } from '../queries/use-scene-list';

export const createSceneMutationOptions = tanstackRPC.scene.createScene.mutationOptions({
  onMutate: async ({ scriptId, seriesId, heading }, ctx) => {
    const queryKey = tanstackRPC.scene.listScenesByScript.queryKey({
      input: { scriptId, limit: 20, offset: 0 },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<SceneListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticScene: SceneListItem = {
      _id: tempId,
      seriesId,
      scriptId,
      sceneNumber: (previous?.total ?? 0) + 1,
      heading,
      locationId: undefined,
      timeOfDay: undefined,
      emotionalTone: undefined,
      characterIds: [],
      lastEditedAt: new Date(),
    };

    ctx.client.setQueryData<SceneListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticScene],
          total: 1,
        } satisfies SceneListQueryReturnType;
      }

      return {
        ...old,
        items: [...old.items, optimisticScene],
        total: old.total + 1,
      } satisfies SceneListQueryReturnType;
    });

    return { previous, tempId, queryKey };
  },
  onSuccess: (createdScene, { scriptId }, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<SceneListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [...withoutTemp, createdScene],
        } satisfies SceneListQueryReturnType;
      });
    }

    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.scene.listScenesByScript.queryKey({ input: { scriptId, limit: 20, offset: 0 } }),
    });
    toastSuccess('Scene created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
    toastORPCError('Failed to create scene', error);
  },
});

export function useCreateScene() {
  const { mutate: createScene, isPending } = useMutation(createSceneMutationOptions);

  return {
    createScene,
    isPending,
  };
}

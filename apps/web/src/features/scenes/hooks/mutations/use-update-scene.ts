import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { SceneDetailQueryReturnType } from '../queries/use-scene';

export const updateSceneMutationOptions = tanstackRPC.scene.updateScene.mutationOptions({
  onMutate: async ({ sceneId, patch }, ctx) => {
    const detailKey = tanstackRPC.scene.getScene.queryKey({ input: { sceneId } });

    await ctx.client.cancelQueries({ queryKey: detailKey });

    const previous = ctx.client.getQueryData<SceneDetailQueryReturnType>(detailKey);

    ctx.client.setQueryData<SceneDetailQueryReturnType>(detailKey, (old) => {
      if (!old) return old;

      return {
        ...old,
        ...patch,
        lastEditedAt: new Date(),
      } satisfies SceneDetailQueryReturnType;
    });

    return { previous, detailKey };
  },
  onSuccess: (updatedScene, _variables, context, ctx) => {
    if (context?.detailKey) {
      ctx.client.setQueryData<SceneDetailQueryReturnType>(context.detailKey, updatedScene);
    }

    void ctx.client.invalidateQueries({
      queryKey: tanstackRPC.scene.listScenesByScript.queryKey({
        input: { scriptId: updatedScene.scriptId, limit: 20, offset: 0 },
      }),
    });
    toastSuccess('Scene updated successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.detailKey && context.previous) {
      ctx.client.setQueryData<SceneDetailQueryReturnType>(context.detailKey, context.previous);
    } else if (context?.detailKey) {
      void ctx.client.invalidateQueries({ queryKey: context.detailKey });
    }
    toastORPCError('Failed to update scene', error);
  },
});

export function useUpdateScene() {
  const { mutate: updateScene, isPending } = useMutation(updateSceneMutationOptions);

  return {
    updateScene,
    isPending,
  };
}

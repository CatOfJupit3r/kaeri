import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const sceneRouter = base.scene.router({
  createScene: protectedProcedure.scene.createScene.handler(async ({ input }) => GETTERS.SceneService().create(input)),

  updateScene: protectedProcedure.scene.updateScene.handler(async ({ input }) =>
    GETTERS.SceneService().update(input.sceneId, input.patch),
  ),

  deleteScene: protectedProcedure.scene.deleteScene.handler(async ({ input }) =>
    GETTERS.SceneService().delete(input.sceneId),
  ),

  listScenesByScript: protectedProcedure.scene.listScenesByScript.handler(async ({ input }) =>
    GETTERS.SceneService().listByScript(input.scriptId, input.limit, input.offset),
  ),

  getScene: protectedProcedure.scene.getScene.handler(async ({ input }) => GETTERS.SceneService().get(input.sceneId)),
});

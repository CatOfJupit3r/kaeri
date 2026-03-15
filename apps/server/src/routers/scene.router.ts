import { contentBase, contentProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const sceneRouter = contentBase.scene.router({
  createScene: contentProtected.scene.createScene.handler(async ({ input }) => GETTERS.SceneService().create(input)),

  updateScene: contentProtected.scene.updateScene.handler(async ({ input }) =>
    GETTERS.SceneService().update(input.sceneId, input.patch),
  ),

  deleteScene: contentProtected.scene.deleteScene.handler(async ({ input }) =>
    GETTERS.SceneService().delete(input.sceneId),
  ),

  listScenesByScript: contentProtected.scene.listScenesByScript.handler(async ({ input }) =>
    GETTERS.SceneService().listByScript(input.scriptId, input.limit, input.offset),
  ),

  getScene: contentProtected.scene.getScene.handler(async ({ input }) => GETTERS.SceneService().get(input.sceneId)),
});

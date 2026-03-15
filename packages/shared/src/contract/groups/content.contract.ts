/**
 * Content contracts - script and scene content
 */
import sceneContract from '../scene.contract';
import scriptsContract from '../scripts.contract';

export const CONTENT_CONTRACT = {
  scripts: scriptsContract,
  scene: sceneContract,
};

export type ContentContract = typeof CONTENT_CONTRACT;

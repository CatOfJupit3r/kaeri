import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

import { SCRIPT_BLOCK_TYPES } from '../types';

export interface iSceneInfo {
  /** Position of the scene heading node */
  pos: number;
  /** Scene number (1-indexed) */
  sceneNumber: number;
  /** Scene reference text (e.g., "INT. APARTMENT - DAY") */
  sceneRef: string;
  /** Linked KB scene entity ID */
  sceneId: string | null;
  /** Linked KB location entity ID */
  locationId: string | null;
  /** Character IDs mentioned in this scene */
  characterIds: string[];
  /** Prop IDs mentioned in this scene */
  propIds: string[];
  /** Start position of scene content */
  contentStart: number;
  /** End position of scene content */
  contentEnd: number;
}

// Type alias for external use
export type SceneInfo = iSceneInfo;

export interface iSceneMetadataStorage {
  /** All detected scenes in document order */
  scenes: iSceneInfo[];
  /** Scene info by position (for quick lookup) */
  sceneByPos: Map<number, iSceneInfo>;
}

// Type alias for external use
export type SceneMetadataStorage = iSceneMetadataStorage;

export interface iSceneMetadataOptions {
  /** Debounce delay for scene detection (ms) */
  debounceMs: number;
  /** Callback when scenes are updated */
  onScenesUpdate?: (scenes: iSceneInfo[]) => void;
}

// Type alias for external use
export type SceneMetadataOptions = iSceneMetadataOptions;

/**
 * Detect all scenes in the document
 */
function detectScenes(doc: ProseMirrorNode): iSceneInfo[] {
  const scenes: iSceneInfo[] = [];
  let currentScene: iSceneInfo | null = null;
  let sceneNumber = 0;

  doc.descendants((node, pos) => {
    // Check if this is a scene heading
    if (node.type.name === SCRIPT_BLOCK_TYPES['scene-heading']) {
      // Finalize previous scene
      if (currentScene) {
        currentScene.contentEnd = pos;
      }

      sceneNumber += 1;
      const sceneRef = node.textContent.trim();

      currentScene = {
        pos,
        sceneNumber,
        sceneRef,
        sceneId: node.attrs.sceneId ?? null,
        locationId: node.attrs.locationId ?? null,
        characterIds: [],
        propIds: [],
        contentStart: pos + node.nodeSize,
        contentEnd: doc.content.size, // Will be updated when next scene starts
      };

      scenes.push(currentScene);
    }

    // Track character blocks with linked IDs
    if (currentScene !== null && node.type.name === SCRIPT_BLOCK_TYPES.character) {
      const scene = currentScene;
      const characterId = node.attrs.characterId as string | null;
      if (characterId && !scene.characterIds.includes(characterId)) {
        scene.characterIds.push(characterId);
      }
    }

    // Track mentions for character and prop IDs
    if (currentScene !== null) {
      const scene = currentScene;
      node.marks.forEach((mark) => {
        if (mark.type.name === 'mentionMark') {
          const entityId = mark.attrs.entityId as string;
          const entityType = mark.attrs.entityType as string;

          if (entityType === 'character' && !scene.characterIds.includes(entityId)) {
            scene.characterIds.push(entityId);
          } else if (entityType === 'prop' && !scene.propIds.includes(entityId)) {
            scene.propIds.push(entityId);
          }
        }
      });
    }

    return true; // Continue traversal
  });

  // Finalize last scene using array access
  const lastScene = scenes.at(-1);
  if (lastScene) {
    lastScene.contentEnd = doc.content.size;
  }

  return scenes;
}

/**
 * Scene Metadata Extension
 *
 * Tracks scene headings and their boundaries in the document.
 */
export const SceneMetadata = Extension.create<iSceneMetadataOptions, iSceneMetadataStorage>({
  name: 'sceneMetadata',

  addOptions() {
    return {
      debounceMs: 250,
      onScenesUpdate: undefined,
    };
  },

  addStorage() {
    return {
      scenes: [],
      sceneByPos: new Map(),
    };
  },

  onCreate() {
    // Initial scene detection
    this.storage.scenes = detectScenes(this.editor.state.doc);
    this.storage.sceneByPos = new Map(this.storage.scenes.map((s: iSceneInfo) => [s.pos, s]));
    this.options.onScenesUpdate?.(this.storage.scenes);
  },

  onUpdate() {
    // Recalculate scenes on document update
    this.storage.scenes = detectScenes(this.editor.state.doc);
    this.storage.sceneByPos = new Map(this.storage.scenes.map((s: iSceneInfo) => [s.pos, s]));
    this.options.onScenesUpdate?.(this.storage.scenes);
  },
});

/**
 * Helper to get scene info at a given cursor position
 */
export function getSceneAtPosition(scenes: iSceneInfo[], pos: number): iSceneInfo | null {
  for (const scene of scenes) {
    if (pos >= scene.pos && pos < scene.contentEnd) {
      return scene;
    }
  }
  return null;
}

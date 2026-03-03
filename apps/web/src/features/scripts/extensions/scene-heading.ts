import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

export interface iSceneHeadingAttributes {
  /** Linked KB location entity ID (null if unlinked) */
  locationId: string | null;
  /** Linked KB scene entity ID (created via ensureScene) */
  sceneId: string | null;
  /** Scene reference string (e.g., "INT. APARTMENT - DAY") */
  sceneRef: string | null;
  class: string;
}

// Type alias for external use
export type SceneHeadingAttributes = iSceneHeadingAttributes;

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    sceneHeading: {
      /** Set a scene heading block */
      setSceneHeading: () => ReturnType;
      /** Toggle scene heading block */
      toggleSceneHeading: () => ReturnType;
      /** Link this scene heading to a KB location entity */
      linkLocation: (locationId: string) => ReturnType;
      /** Unlink this scene heading from KB location */
      unlinkLocation: () => ReturnType;
      /** Link this scene heading to a KB scene entity */
      linkScene: (sceneId: string, sceneRef?: string) => ReturnType;
      /** Update the scene reference string */
      updateSceneRef: (sceneRef: string) => ReturnType;
    };
  }
}

export const SceneHeading = Node.create({
  name: SCRIPT_BLOCK_TYPES['scene-heading'],

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      locationId: {
        default: null,
        parseHTML: (element) => element.dataset.locationId,
        renderHTML: (attributes: iSceneHeadingAttributes) =>
          attributes.locationId ? { 'data-location-id': attributes.locationId } : {},
      },
      sceneId: {
        default: null,
        parseHTML: (element) => element.dataset.sceneId,
        renderHTML: (attributes: iSceneHeadingAttributes) =>
          attributes.sceneId ? { 'data-scene-id': attributes.sceneId } : {},
      },
      sceneRef: {
        default: null,
        parseHTML: (element) => element.dataset.sceneRef,
        renderHTML: (attributes: iSceneHeadingAttributes) =>
          attributes.sceneRef ? { 'data-scene-ref': attributes.sceneRef } : {},
      },
      class: {
        default: 'script-block script-block--scene-heading',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="scene-heading"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'scene-heading',
        class: 'script-block script-block--scene-heading',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setSceneHeading:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      toggleSceneHeading:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph'),
      linkLocation:
        (locationId: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { locationId }),
      unlinkLocation:
        () =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { locationId: null }),
      linkScene:
        (sceneId: string, sceneRef?: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { sceneId, sceneRef: sceneRef ?? null }),
      updateSceneRef:
        (sceneRef: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { sceneRef }),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-1': () => this.editor.commands.setSceneHeading(),
    };
  },
});

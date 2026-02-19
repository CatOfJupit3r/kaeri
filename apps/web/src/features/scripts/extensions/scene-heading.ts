import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    sceneHeading: {
      /** Set a scene heading block */
      setSceneHeading: () => ReturnType;
      /** Toggle scene heading block */
      toggleSceneHeading: () => ReturnType;
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
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-1': () => this.editor.commands.setSceneHeading(),
    };
  },
});

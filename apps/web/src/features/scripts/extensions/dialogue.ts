import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    dialogue: {
      /** Set a dialogue block */
      setDialogue: () => ReturnType;
      /** Toggle dialogue block */
      toggleDialogue: () => ReturnType;
    };
  }
}

export const Dialogue = Node.create({
  name: SCRIPT_BLOCK_TYPES.dialogue,

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      class: {
        default: 'script-block script-block--dialogue',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="dialogue"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'dialogue',
        class: 'script-block script-block--dialogue',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setDialogue:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      toggleDialogue:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph'),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-4': () => this.editor.commands.setDialogue(),
      'Mod-d': () => this.editor.commands.setDialogue(),
    };
  },
});

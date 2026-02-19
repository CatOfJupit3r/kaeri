import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    character: {
      /** Set a character block */
      setCharacter: () => ReturnType;
      /** Toggle character block */
      toggleCharacter: () => ReturnType;
    };
  }
}

export const Character = Node.create({
  name: SCRIPT_BLOCK_TYPES.character,

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      class: {
        default: 'script-block script-block--character',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="character"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'character',
        class: 'script-block script-block--character',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCharacter:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      toggleCharacter:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph'),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-3': () => this.editor.commands.setCharacter(),
      'Mod-c': () => this.editor.commands.setCharacter(),
    };
  },
});

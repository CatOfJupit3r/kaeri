import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    parenthetical: {
      /** Set a parenthetical block */
      setParenthetical: () => ReturnType;
      /** Toggle parenthetical block */
      toggleParenthetical: () => ReturnType;
    };
  }
}

export const Parenthetical = Node.create({
  name: SCRIPT_BLOCK_TYPES.parenthetical,

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      class: {
        default: 'script-block script-block--parenthetical',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="parenthetical"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'parenthetical',
        class: 'script-block script-block--parenthetical',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setParenthetical:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      toggleParenthetical:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph'),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-5': () => this.editor.commands.setParenthetical(),
      'Mod-w': () => this.editor.commands.setParenthetical(),
    };
  },
});

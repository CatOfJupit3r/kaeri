import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    action: {
      /** Set an action block */
      setAction: () => ReturnType;
      /** Toggle action block */
      toggleAction: () => ReturnType;
    };
  }
}

export const Action = Node.create({
  name: SCRIPT_BLOCK_TYPES.action,

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      class: {
        default: 'script-block script-block--action',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="action"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'action',
        class: 'script-block script-block--action',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAction:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      toggleAction:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph'),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-2': () => this.editor.commands.setAction(),
      'Mod-a': () => this.editor.commands.setAction(),
    };
  },
});

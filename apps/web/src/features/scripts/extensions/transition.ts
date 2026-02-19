import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    transition: {
      /** Set a transition block */
      setTransition: () => ReturnType;
      /** Toggle transition block */
      toggleTransition: () => ReturnType;
    };
  }
}

export const Transition = Node.create({
  name: SCRIPT_BLOCK_TYPES.transition,

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      class: {
        default: 'script-block script-block--transition',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="transition"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'transition',
        class: 'script-block script-block--transition',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setTransition:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      toggleTransition:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph'),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-6': () => this.editor.commands.setTransition(),
      'Mod-t': () => this.editor.commands.setTransition(),
    };
  },
});

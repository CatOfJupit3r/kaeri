import { mergeAttributes, Node } from '@tiptap/core';

import { SCRIPT_BLOCK_TYPES } from '../types';

export interface iCharacterAttributes {
  /** Linked KB character entity ID (null if unlinked) */
  characterId: string | null;
  class: string;
}

// Type alias for external use
export type CharacterAttributes = iCharacterAttributes;

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    character: {
      /** Set a character block */
      setCharacter: () => ReturnType;
      /** Toggle character block */
      toggleCharacter: () => ReturnType;
      /** Link this character block to a KB character entity */
      linkCharacter: (characterId: string) => ReturnType;
      /** Unlink this character block from KB */
      unlinkCharacter: () => ReturnType;
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
      characterId: {
        default: null,
        parseHTML: (element) => element.dataset.characterId,
        renderHTML: (attributes: iCharacterAttributes) =>
          attributes.characterId ? { 'data-character-id': attributes.characterId } : {},
      },
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
      linkCharacter:
        (characterId: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { characterId }),
      unlinkCharacter:
        () =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { characterId: null }),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-3': () => this.editor.commands.setCharacter(),
      'Mod-c': () => this.editor.commands.setCharacter(),
    };
  },
});

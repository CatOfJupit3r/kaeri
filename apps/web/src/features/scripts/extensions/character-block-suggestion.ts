import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';

import { SCRIPT_BLOCK_TYPES } from '../types';

export interface iCharacterBlockSuggestion {
  _id: string;
  name: string;
  avatarUrl?: string;
  preview?: string;
}

// Type alias for external use
export type CharacterBlockSuggestion = iCharacterBlockSuggestion;

export interface iCharacterBlockSuggestionOptions {
  suggestion: Partial<SuggestionOptions<iCharacterBlockSuggestion>>;
  /** Callback when character is selected */
  onSelect?: (props: { editor: Editor; character: iCharacterBlockSuggestion; range: Range }) => void;
  /** Callback when "+ Create" is selected */
  onCreate?: (props: { name: string; editor: Editor; range: Range }) => void;
}

// Type alias for external use
export type CharacterBlockSuggestionOptions = iCharacterBlockSuggestionOptions;

export const characterBlockSuggestionKey = new PluginKey('characterBlockSuggestion');

/**
 * Character Block Suggestion Extension.
 *
 * Triggers character suggestions when typing `/` in a Character block.
 * Use `/` followed by character name to filter suggestions.
 */
export const CharacterBlockSuggestion = Extension.create<iCharacterBlockSuggestionOptions>({
  name: 'characterBlockSuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: true,
        startOfLine: false,
      },
      onSelect: undefined,
      onCreate: undefined,
    };
  },

  addProseMirrorPlugins() {
    const { onSelect } = this.options;

    return [
      Suggestion({
        pluginKey: characterBlockSuggestionKey,
        editor: this.editor,
        char: '/',
        allowSpaces: true,
        startOfLine: false,

        // Only trigger in character blocks
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const node = $from.parent;
          const nodeType = node?.type.name;

          // Only trigger in character blocks
          return nodeType === SCRIPT_BLOCK_TYPES.character;
        },

        // The command to run when a character is selected
        command: ({ editor, range, props }) => {
          const character = props as iCharacterBlockSuggestion;

          if (onSelect) {
            onSelect({
              editor,
              character,
              range,
            });
          } else {
            // Default behavior: replace content with character name and set characterId
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent(character.name)
              .command(({ tr, state }) => {
                // Find the character block node and update its characterId
                const $pos = state.doc.resolve(state.selection.from);
                const characterNode = $pos.parent;

                if (characterNode.type.name === SCRIPT_BLOCK_TYPES.character) {
                  const nodePos = $pos.before($pos.depth);
                  tr.setNodeMarkup(nodePos, undefined, {
                    ...characterNode.attrs,
                    characterId: character._id,
                  });
                }
                return true;
              })
              .run();
          }
        },

        // Render configuration - will be provided by the component
        ...this.options.suggestion,
      }),
    ];
  },
});

/**
 * Type for suggestion render props (passed to React component)
 */
export type CharacterBlockSuggestionRenderProps = SuggestionProps<iCharacterBlockSuggestion>;

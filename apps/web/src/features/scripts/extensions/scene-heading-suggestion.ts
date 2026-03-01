import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';

import { SCRIPT_BLOCK_TYPES } from '../types';

export interface iLocationBlockSuggestion {
  _id: string;
  name: string;
  avatarUrl?: string;
  preview?: string;
}

// Type alias for external use
export type LocationBlockSuggestion = iLocationBlockSuggestion;

export interface iSceneHeadingSuggestionOptions {
  suggestion: Partial<SuggestionOptions<iLocationBlockSuggestion>>;
  /** Callback when location is selected */
  onSelect?: (props: { editor: Editor; location: iLocationBlockSuggestion; range: Range }) => void;
  /** Callback when "+ Create" is selected */
  onCreate?: (props: { name: string; editor: Editor; range: Range }) => void;
}

// Type alias for external use
export type SceneHeadingSuggestionOptions = iSceneHeadingSuggestionOptions;

export const sceneHeadingSuggestionKey = new PluginKey('sceneHeadingSuggestion');

/**
 * Scene Heading Suggestion Extension.
 *
 * Triggers location suggestions when typing `/` after INT./EXT. prefix in Scene Heading blocks.
 * Example: "INT. /" will show location suggestions.
 */
export const SceneHeadingSuggestion = Extension.create<iSceneHeadingSuggestionOptions>({
  name: 'sceneHeadingSuggestion',

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
        pluginKey: sceneHeadingSuggestionKey,
        editor: this.editor,
        char: '/',
        allowSpaces: true,
        startOfLine: false,

        // Only trigger in scene heading blocks after INT./EXT. prefix
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const node = $from.parent;
          const nodeType = node?.type.name;

          // Only trigger in scene heading blocks
          if (nodeType !== SCRIPT_BLOCK_TYPES['scene-heading']) {
            return false;
          }

          // Check if we have INT./EXT. prefix before the / trigger
          const text = node.textContent;
          const offsetBeforeTrigger = Math.max(0, $from.parentOffset - 1); // -1 to exclude the /
          const textBeforeTrigger = text.substring(0, offsetBeforeTrigger);

          // Allow if we have the INT./EXT. prefix (with optional space)
          const prefixPattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)(\s*)$/i;
          return prefixPattern.test(textBeforeTrigger);
        },

        // The command to run when a location is selected
        command: ({ editor, range, props }) => {
          const location = props as iLocationBlockSuggestion;

          if (onSelect) {
            onSelect({
              editor,
              location,
              range,
            });
          } else {
            // Get the current text to preserve the INT./EXT. prefix
            const { state } = editor;
            const $from = state.doc.resolve(range.from);
            const node = $from.parent;
            const text = node.textContent;
            const prefixMatch = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*/i.exec(text);
            const prefix = prefixMatch ? prefixMatch[0] : '';

            // Replace with prefix + location name
            editor
              .chain()
              .focus()
              .command(({ tr, state: cmdState }) => {
                const $pos = cmdState.doc.resolve(cmdState.selection.from);
                const nodePos = $pos.before($pos.depth);
                const nodeEnd = nodePos + node.nodeSize;

                // Delete the entire node content and insert prefix + location
                tr.delete(nodePos + 1, nodeEnd - 1);
                tr.insertText(`${prefix}${location.name}`, nodePos + 1);

                // Update the locationId attribute
                tr.setNodeMarkup(nodePos, undefined, {
                  ...node.attrs,
                  locationId: location._id,
                });

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
export type SceneHeadingSuggestionRenderProps = SuggestionProps<iLocationBlockSuggestion>;

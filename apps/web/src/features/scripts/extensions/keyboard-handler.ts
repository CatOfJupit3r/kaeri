import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { Selection, TextSelection } from '@tiptap/pm/state';

import { BLOCK_TYPE_CYCLE_ORDER, NEXT_BLOCK_TYPE_MAP } from '../types';
import type { ScriptBlockType } from '../types';
import { characterBlockSuggestionKey } from './character-block-suggestion';
import { sceneHeadingSuggestionKey } from './scene-heading-suggestion';
import { sceneTimeOfDaySuggestionKey } from './scene-time-of-day-suggestion';

function isScriptAutocompleteActive(editor: Editor) {
  return (
    characterBlockSuggestionKey.getState(editor.state)?.active === true ||
    sceneHeadingSuggestionKey.getState(editor.state)?.active === true ||
    sceneTimeOfDaySuggestionKey.getState(editor.state)?.active === true
  );
}

/**
 * Extension for custom keyboard behavior in the script editor
 * Handles Enter, Tab, Backspace according to spec
 */
export const ScriptKeyboardHandler = Extension.create({
  name: 'scriptKeyboardHandler',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (isScriptAutocompleteActive(editor)) {
          return false;
        }

        const { state } = editor;
        const { $from } = state.selection;
        const currentNode = $from.parent;
        const currentType = currentNode.type.name as ScriptBlockType;

        // Get the next block type based on current block
        const nextType = NEXT_BLOCK_TYPE_MAP[currentType] ?? 'action';

        // Insert a new block of the appropriate type after current position
        editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              // Create new node at end of current block
              const nodeType = editor.schema.nodes[nextType];
              if (nodeType) {
                const endPos = $from.end();
                const newNode = nodeType.create();
                tr.insert(endPos + 1, newNode);
                // Set selection to new node
                tr.setSelection(Selection.near(tr.doc.resolve(endPos + 2)));
              }
            }
            return true;
          })
          .run();

        // Scroll the new block into view after a brief delay for DOM update
        requestAnimationFrame(() => {
          const { view } = editor;
          const { from } = editor.state.selection;
          try {
            const coords = view.coordsAtPos(from);
            const editorContainer = view.dom.closest('.overflow-y-auto');
            if (editorContainer) {
              const containerRect = editorContainer.getBoundingClientRect();
              const scrollPadding = 100; // Extra space below the new block

              // If new block is below visible area, scroll to show it
              if (coords.bottom > containerRect.bottom - scrollPadding) {
                editorContainer.scrollTo({
                  top: editorContainer.scrollTop + (coords.bottom - containerRect.bottom) + scrollPadding,
                  behavior: 'smooth',
                });
              }
            }
          } catch {
            // Ignore scroll errors
          }
        });

        return true;
      },

      Tab: ({ editor }) => {
        if (isScriptAutocompleteActive(editor)) {
          return false;
        }

        const { state } = editor;
        const { $from } = state.selection;
        const currentNode = $from.parent;
        const currentType = currentNode.type.name as ScriptBlockType;

        // Find current position in cycle
        const currentIndex = BLOCK_TYPE_CYCLE_ORDER.indexOf(currentType);
        if (currentIndex === -1) return false;

        // Get next type in cycle
        const nextIndex = (currentIndex + 1) % BLOCK_TYPE_CYCLE_ORDER.length;
        const nextType = BLOCK_TYPE_CYCLE_ORDER[nextIndex];

        // Change current block type
        const nodeType = editor.schema.nodes[nextType];
        if (nodeType) {
          return editor.chain().focus().setNode(nextType).run();
        }

        return false;
      },

      'Shift-Tab': ({ editor }) => {
        if (isScriptAutocompleteActive(editor)) {
          return false;
        }

        const { state } = editor;
        const { $from } = state.selection;
        const currentNode = $from.parent;
        const currentType = currentNode.type.name as ScriptBlockType;

        // Find current position in cycle
        const currentIndex = BLOCK_TYPE_CYCLE_ORDER.indexOf(currentType);
        if (currentIndex === -1) return false;

        // Get previous type in cycle
        const prevIndex = (currentIndex - 1 + BLOCK_TYPE_CYCLE_ORDER.length) % BLOCK_TYPE_CYCLE_ORDER.length;
        const prevType = BLOCK_TYPE_CYCLE_ORDER[prevIndex];

        // Change current block type
        const nodeType = editor.schema.nodes[prevType];
        if (nodeType) {
          return editor.chain().focus().setNode(prevType).run();
        }

        return false;
      },

      ArrowUp: ({ editor }) => {
        if (isScriptAutocompleteActive(editor)) {
          return false;
        }

        const { state } = editor;
        const { $from, empty: isEmpty } = state.selection;

        if (!isEmpty || $from.parentOffset !== 0) {
          return false;
        }

        const currentBlockStart = $from.start($from.depth);
        if (currentBlockStart <= 1) {
          return false;
        }

        const targetPos = currentBlockStart - 2;

        return editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              tr.setSelection(TextSelection.create(tr.doc, targetPos));
            }

            return true;
          })
          .run();
      },

      ArrowDown: ({ editor }) => {
        if (isScriptAutocompleteActive(editor)) {
          return false;
        }

        const { state } = editor;
        const { $from, empty: isEmpty } = state.selection;

        if (!isEmpty || $from.parentOffset !== $from.parent.content.size) {
          return false;
        }

        const currentBlockEnd = $from.end($from.depth);
        const targetPos = currentBlockEnd + 2;

        if (targetPos > state.doc.content.size) {
          return false;
        }

        return editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              tr.setSelection(TextSelection.create(tr.doc, targetPos));
            }

            return true;
          })
          .run();
      },

      Backspace: ({ editor }) => {
        const { state } = editor;
        const { $from, empty: isEmpty } = state.selection;
        const currentNode = $from.parent;

        // Only handle backspace at start of empty block
        if (!isEmpty || $from.parentOffset !== 0) {
          return false;
        }

        // Don't delete the last block
        if (state.doc.childCount <= 1) {
          return false;
        }

        // Delete current block if empty and cursor at start
        if (currentNode.textContent === '') {
          return editor.chain().focus().deleteNode(currentNode.type.name).run();
        }

        return false;
      },
    };
  },
});

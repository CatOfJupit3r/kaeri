import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';

import { SCRIPT_BLOCK_TYPES } from '../types';

export interface iSceneTimeOfDaySuggestion {
  _id: string;
  name: string;
}

export type SceneTimeOfDaySuggestion = iSceneTimeOfDaySuggestion;

export interface iSceneTimeOfDaySuggestionOptions {
  suggestion: Partial<SuggestionOptions<iSceneTimeOfDaySuggestion>>;
  onSelect?: (props: { editor: Editor; timeOfDay: iSceneTimeOfDaySuggestion; range: Range }) => void;
}

export type SceneTimeOfDaySuggestionOptions = iSceneTimeOfDaySuggestionOptions;

export const sceneTimeOfDaySuggestionKey = new PluginKey('sceneTimeOfDaySuggestion');

function getSceneHeadingPrefix(text: string) {
  return /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*/i.exec(text)?.[0] ?? '';
}

function getSceneHeadingLocationText(text: string) {
  const prefix = getSceneHeadingPrefix(text);
  const contentWithoutPrefix = prefix ? text.slice(prefix.length) : text;

  return contentWithoutPrefix.split(/\s*-\s*/)[0]?.trim() ?? contentWithoutPrefix.trim();
}

export const SceneTimeOfDaySuggestion = Extension.create<iSceneTimeOfDaySuggestionOptions>({
  name: 'sceneTimeOfDaySuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '-',
        allowSpaces: true,
        startOfLine: false,
      },
      onSelect: undefined,
    };
  },

  addProseMirrorPlugins() {
    const { onSelect } = this.options;

    return [
      Suggestion({
        pluginKey: sceneTimeOfDaySuggestionKey,
        editor: this.editor,
        char: '-',
        allowSpaces: true,
        startOfLine: false,

        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const node = $from.parent;

          if (node?.type.name !== SCRIPT_BLOCK_TYPES['scene-heading']) {
            return false;
          }

          if (typeof node.attrs.locationId !== 'string' || node.attrs.locationId.length === 0) {
            return false;
          }

          const text = node.textContent;
          const offsetBeforeTrigger = Math.max(0, $from.parentOffset - 1);
          const textBeforeTrigger = text.substring(0, offsetBeforeTrigger);
          const prefix = getSceneHeadingPrefix(textBeforeTrigger);

          if (!prefix) {
            return false;
          }

          const contentAfterPrefix = textBeforeTrigger.slice(prefix.length);

          return contentAfterPrefix.trim().length > 0 && !/\s-\s/.test(contentAfterPrefix);
        },

        command: ({ editor, range, props }) => {
          const timeOfDay = props as iSceneTimeOfDaySuggestion;

          if (onSelect) {
            onSelect({
              editor,
              timeOfDay,
              range,
            });
            return;
          }

          const { state } = editor;
          const $from = state.doc.resolve(range.from);
          const node = $from.parent;
          const text = node.textContent;
          const prefix = getSceneHeadingPrefix(text);
          const locationText = getSceneHeadingLocationText(text);

          if (!locationText) {
            return;
          }

          editor
            .chain()
            .focus()
            .command(({ tr, state: cmdState }) => {
              const $pos = cmdState.doc.resolve(cmdState.selection.from);
              const nodePos = $pos.before($pos.depth);
              const nodeEnd = nodePos + node.nodeSize;

              tr.delete(nodePos + 1, nodeEnd - 1);
              tr.insertText(`${prefix}${locationText} - ${timeOfDay.name}`, nodePos + 1);

              return true;
            })
            .run();
        },

        ...this.options.suggestion,
      }),
    ];
  },
});

export type SceneTimeOfDaySuggestionRenderProps = SuggestionProps<iSceneTimeOfDaySuggestion>;

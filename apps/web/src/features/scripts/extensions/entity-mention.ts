import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';

export type EntityType = 'character' | 'prop' | 'wildcard';

export interface iEntitySuggestion {
  _id: string;
  name: string;
  avatarUrl?: string;
  preview?: string;
}

// Type alias for external use
export type EntitySuggestion = iEntitySuggestion;

export interface iEntityMentionPluginState {
  query: string;
  range: Range | null;
  isOpen: boolean;
  entityType: EntityType;
}

// Type alias for external use
export type EntityMentionPluginState = iEntityMentionPluginState;

export interface iEntityMentionOptions {
  suggestion: Partial<SuggestionOptions<iEntitySuggestion>>;
  /** Trigger character: @ for characters, # for props, ! for wildcards */
  triggerChar: string;
  /** Entity type this extension handles */
  entityType: EntityType;
  /** Block types where this mention is allowed */
  allowedBlockTypes: string[];
  /** Callback when entity is selected */
  onSelect?: (props: { editor: Editor; entity: iEntitySuggestion; range: Range; entityType: EntityType }) => void;
  /** Callback when "+ Create" is selected */
  onCreate?: (props: { query: string; entityType: EntityType; editor: Editor; range: Range }) => void;
}

// Type alias for external use
export type EntityMentionOptions = iEntityMentionOptions;

/**
 * Creates an EntityMention extension with customizable trigger and entity type
 */
export function createEntityMentionExtension(options: {
  name: string;
  triggerChar: string;
  entityType: EntityType;
  allowedBlockTypes: string[];
}) {
  return Extension.create<EntityMentionOptions>({
    name: options.name,

    addOptions() {
      return {
        suggestion: {
          char: options.triggerChar,
          allowSpaces: false,
          startOfLine: false,
        },
        triggerChar: options.triggerChar,
        entityType: options.entityType,
        allowedBlockTypes: options.allowedBlockTypes,
        onSelect: undefined,
        onCreate: undefined,
      };
    },

    addProseMirrorPlugins() {
      const { triggerChar, entityType, allowedBlockTypes, onSelect } = this.options;

      return [
        Suggestion({
          pluginKey: new PluginKey(`${options.name}-suggestion`),
          editor: this.editor,
          char: triggerChar,
          allowSpaces: false,
          startOfLine: false,

          // Check if we're in an allowed block type
          allow: ({ state, range }) => {
            const $from = state.doc.resolve(range.from);
            const node = $from.node();
            const nodeType = node?.type.name;

            return allowedBlockTypes.includes(nodeType);
          },

          // The command to run when an item is selected
          command: ({ editor, range, props }) => {
            if (onSelect) {
              onSelect({
                editor,
                entity: props as EntitySuggestion,
                range,
                entityType,
              });
            } else {
              // Default behavior: insert mention mark with entity name
              const entity = props as EntitySuggestion;
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent([
                  {
                    type: 'text',
                    text: entity.name,
                    marks: [
                      {
                        type: 'mention',
                        attrs: {
                          entityId: entity._id,
                          entityType,
                          entityName: entity.name,
                        },
                      },
                    ],
                  },
                ])
                .run();
            }
          },

          // Render configuration - will be provided by the component
          ...this.options.suggestion,
        }),
      ];
    },
  });
}

/**
 * Character mention extension (@ trigger) for Action blocks
 */
export const CharacterMention = createEntityMentionExtension({
  name: 'characterMention',
  triggerChar: '@',
  entityType: 'character',
  allowedBlockTypes: ['action', 'dialogue'],
});

/**
 * Prop mention extension (# trigger) for Action blocks
 */
export const PropMention = createEntityMentionExtension({
  name: 'propMention',
  triggerChar: '#',
  entityType: 'prop',
  allowedBlockTypes: ['action'],
});

/**
 * Wildcard mention extension (! trigger) for any block
 */
export const WildcardMention = createEntityMentionExtension({
  name: 'wildcardMention',
  triggerChar: '!',
  entityType: 'wildcard',
  allowedBlockTypes: ['action', 'scene-heading', 'dialogue', 'character', 'transition', 'parenthetical'],
});

/**
 * Helper function to configure suggestion rendering
 */
export function configureSuggestion(
  extension: ReturnType<typeof createEntityMentionExtension>,
  suggestionConfig: Partial<SuggestionOptions<EntitySuggestion>>,
) {
  return extension.configure({
    suggestion: suggestionConfig,
  });
}

/**
 * Type for suggestion render props (passed to React component)
 */
export type EntityMentionRenderProps = SuggestionProps<EntitySuggestion> & {
  entityType: EntityType;
};

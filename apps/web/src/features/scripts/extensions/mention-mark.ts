import { Mark, mergeAttributes } from '@tiptap/core';

export interface iMentionMarkAttributes {
  entityId: string;
  entityType: 'character' | 'prop' | 'wildcard' | 'theme' | 'location';
  entityName?: string;
}

// Type alias for external use
export type MentionMarkAttributes = iMentionMarkAttributes;

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    mentionMark: {
      /** Set a mention mark */
      setMention: (attributes: iMentionMarkAttributes) => ReturnType;
      /** Toggle a mention mark */
      toggleMention: (attributes: iMentionMarkAttributes) => ReturnType;
      /** Unset any mention mark */
      unsetMention: () => ReturnType;
    };
  }
}

export const MentionMark = Mark.create<Record<string, never>, iMentionMarkAttributes>({
  name: 'mention',

  // Mentions are inline with their surrounding text
  inclusive: false,

  // Allow this mark to coexist with bold/italic
  excludes: '',

  addAttributes() {
    return {
      entityId: {
        default: null,
        parseHTML: (element) => element.dataset.entityId,
        renderHTML: (attributes: MentionMarkAttributes) => ({
          'data-entity-id': attributes.entityId,
        }),
      },
      entityType: {
        default: null,
        parseHTML: (element) => element.dataset.entityType,
        renderHTML: (attributes: MentionMarkAttributes) => ({
          'data-entity-type': attributes.entityType,
        }),
      },
      entityName: {
        default: null,
        parseHTML: (element) => element.dataset.entityName,
        renderHTML: (attributes: MentionMarkAttributes) => ({
          'data-entity-name': attributes.entityName,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-entity-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const entityType = HTMLAttributes['data-entity-type'] as string;
    const className = `mention mention--${entityType}`;

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: className,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setMention:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      toggleMention:
        (attributes) =>
        ({ commands }) =>
          commands.toggleMark(this.name, attributes),
      unsetMention:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

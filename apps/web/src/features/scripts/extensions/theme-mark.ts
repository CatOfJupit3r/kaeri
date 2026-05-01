import { Mark, mergeAttributes } from '@tiptap/core';

export interface iThemeMarkAttributes {
  themeId: string;
  themeName: string;
  themeColor?: string;
}

export type ThemeMarkAttributes = iThemeMarkAttributes;

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Tiptap command augmentation must merge into Commands.
  interface Commands<ReturnType> {
    themeMark: {
      setTheme: (attributes: iThemeMarkAttributes) => ReturnType;
      toggleTheme: (attributes: iThemeMarkAttributes) => ReturnType;
      unsetTheme: () => ReturnType;
    };
  }
}

export const ThemeMark = Mark.create<Record<string, never>, iThemeMarkAttributes>({
  name: 'theme',
  inclusive: false,
  excludes: '',

  addAttributes() {
    return {
      themeId: {
        default: null,
        parseHTML: (element) => element.dataset.themeId,
        renderHTML: (attributes: ThemeMarkAttributes) => ({
          'data-theme-id': attributes.themeId,
        }),
      },
      themeName: {
        default: null,
        parseHTML: (element) => element.dataset.themeName,
        renderHTML: (attributes: ThemeMarkAttributes) => ({
          'data-theme-name': attributes.themeName,
        }),
      },
      themeColor: {
        default: null,
        parseHTML: (element) => element.dataset.themeColor,
        renderHTML: (attributes: ThemeMarkAttributes) =>
          attributes.themeColor
            ? {
                'data-theme-color': attributes.themeColor,
              }
            : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-theme-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const themeColor = HTMLAttributes['data-theme-color'] as string | undefined;

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'theme-tag',
        style: themeColor ? `--theme-tag-color: ${themeColor};` : undefined,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setTheme:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      toggleTheme:
        (attributes) =>
        ({ commands }) =>
          commands.toggleMark(this.name, attributes),
      unsetTheme:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import History from '@tiptap/extension-history';
import Italic from '@tiptap/extension-italic';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { useCallback, useEffect, useRef } from 'react';
import { LuPlus } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';

import {
  Action,
  Character,
  Dialogue,
  Parenthetical,
  SceneHeading,
  ScriptKeyboardHandler,
  Transition,
} from '../extensions';
import { BLOCK_CONFIG } from '../helpers/block-config';
import type { ScriptBlockType } from '../types';
import { BLOCK_TYPE_CYCLE_ORDER } from '../types';
import { EditorToolbar } from './editor-toolbar';

interface iScriptEditorProps {
  /** Script content as JSON string */
  content: string;
  /** Callback when content changes */
  onContentChange?: (content: string) => void;
  /** Script title */
  title?: string;
  /** Callback to open script settings */
  onOpenSettings?: () => void;
  /** Callback to open export dialog */
  onExport?: () => void;
  /** Whether the content is currently saving */
  isSaving?: boolean;
  /** Last edit timestamp */
  lastEditedAt?: Date;
}

/**
 * Default content for new scripts
 */
const DEFAULT_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'scene-heading',
      content: [],
    },
  ],
};

/**
 * Parse content string to tiptap JSON
 */
function parseContent(content: string): Record<string, unknown> {
  if (!content) return DEFAULT_CONTENT;

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (parsed.type === 'doc') return parsed;
    return DEFAULT_CONTENT;
  } catch {
    // If not valid JSON, convert plain text to blocks
    return convertPlainTextToDoc(content);
  }
}

/**
 * Convert plain text to tiptap document structure
 */
function convertPlainTextToDoc(text: string): Record<string, unknown> {
  const lines = text.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return DEFAULT_CONTENT;

  const content = lines.map((line) => {
    const trimmed = line.trim();
    let type: ScriptBlockType = 'action';

    // Detect block type from content
    if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmed)) {
      type = 'scene-heading';
    } else if (/^(FADE IN:|FADE OUT|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)$/i.test(trimmed)) {
      type = 'transition';
    } else if (/^\(.*\)$/.test(trimmed)) {
      type = 'parenthetical';
    }

    return {
      type,
      content: trimmed ? [{ type: 'text', text: trimmed }] : [],
    };
  });

  return { type: 'doc', content };
}

export function ScriptEditor({
  content,
  onContentChange,
  title,
  onOpenSettings,
  onExport,
  isSaving,
  lastEditedAt,
}: iScriptEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const rightPanelTab = 'knowledge'; // TODO: Make this stateful

  const editor = useEditor({
    extensions: [
      Document,
      Text,
      Bold,
      Italic,
      Underline,
      History,
      Dropcursor,
      Gapcursor,
      Placeholder.configure({
        placeholder: ({ node }) => {
          const type = node.type.name as ScriptBlockType;
          return BLOCK_CONFIG[type]?.placeholder ?? 'Type something...';
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      // Custom screenplay block nodes
      SceneHeading,
      Action,
      Character,
      Dialogue,
      Parenthetical,
      Transition,
      // Custom keyboard handling
      ScriptKeyboardHandler,
    ],
    content: parseContent(content),
    editorProps: {
      attributes: {
        class: 'script-editor-content prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor: e }) => {
      // Debounce content changes for autosave
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const json = e.getJSON();
        onContentChange?.(JSON.stringify(json));
      }, 300);
    },
  });

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const addBlock = useCallback(
    (type: ScriptBlockType) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .command(({ tr, dispatch, state }) => {
          if (dispatch) {
            const nodeType = state.schema.nodes[type];
            if (nodeType) {
              const endPos = state.doc.content.size;
              const newNode = nodeType.create();
              tr.insert(endPos, newNode);
            }
          }
          return true;
        })
        .run();
    },
    [editor],
  );

  const getCurrentBlockType = useCallback((): ScriptBlockType | null => {
    if (!editor) return null;
    const { $from } = editor.state.selection;
    return $from.parent.type.name as ScriptBlockType;
  }, [editor]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <EditorToolbar
        editor={editor}
        title={title}
        onOpenSettings={onOpenSettings}
        onExport={onExport}
        isSaving={isSaving}
        lastEditedAt={lastEditedAt}
        currentBlockType={getCurrentBlockType()}
        onChangeBlockType={(type) => {
          editor?.chain().focus().setNode(type).run();
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Editor Panel */}
        <div className="flex h-1/2 w-full flex-col overflow-hidden border-b border-border lg:h-full lg:w-1/2 lg:border-r lg:border-b-0">
          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} className="h-full" />
          </div>

          {/* Add Block Button */}
          <div className="border-t border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Add block:</span>
              {BLOCK_TYPE_CYCLE_ORDER.map((type) => {
                const config = BLOCK_CONFIG[type];
                return (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock(type)}
                    className="gap-1.5 text-xs"
                    style={{
                      borderColor: config.borderColorVar,
                    }}
                  >
                    {config.icon}
                    <span className="hidden sm:inline">{config.label}</span>
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => addBlock('action')} className="gap-1">
                <LuPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Knowledge Base / Canvas */}
        <div className="flex h-1/2 w-full flex-col overflow-hidden lg:h-full lg:w-1/2">
          <Tabs defaultValue={rightPanelTab} className="flex h-full flex-col">
            <div className="border-b border-border px-4">
              <TabsList className="h-12">
                <TabsTrigger value="knowledge" className="gap-2">
                  Knowledge Base
                </TabsTrigger>
                <TabsTrigger value="canvas" className="gap-2">
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                  AI Assistant
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="knowledge" className="mt-0 flex-1 overflow-y-auto p-4">
              <div className="text-center text-muted-foreground">
                <p>Knowledge Base panel</p>
                <p className="text-sm">Characters, locations, and props from this series</p>
              </div>
            </TabsContent>
            <TabsContent value="canvas" className="mt-0 flex-1 overflow-y-auto p-4">
              <div className="text-center text-muted-foreground">
                <p>Canvas panel</p>
                <p className="text-sm">Visual planning and storyboarding</p>
              </div>
            </TabsContent>
            <TabsContent value="ai" className="mt-0 flex-1 overflow-y-auto p-4">
              <div className="text-center text-muted-foreground">
                <p>AI Assistant</p>
                <p className="text-sm">Coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

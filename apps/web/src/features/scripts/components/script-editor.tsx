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
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuBookOpen, LuPenTool, LuPlus, LuSparkles } from 'react-icons/lu';

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
import { KnowledgeBasePanel } from './knowledge-base-panel';

interface iScriptEditorProps {
  /** Script content as JSON string */
  content: string;
  /** Callback when content changes */
  onContentChange?: (content: string) => void;
  /** Script title */
  title?: string;
  /** Series ID for fetching knowledge base data */
  seriesId: string;
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
  seriesId,
  onOpenSettings,
  onExport,
  isSaving,
  lastEditedAt,
}: iScriptEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState('knowledge');

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
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex h-full flex-col">
            <TabsList className="h-auto shrink-0 justify-start gap-0 border-b-2 border-foreground bg-card p-0">
              <TabsTrigger
                value="knowledge"
                className="flex-1 gap-2 border-r-2 border-foreground py-3 font-black tracking-wide uppercase data-[state=active]:bg-(--brutalist-blue) data-[state=active]:text-white"
              >
                <LuBookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Knowledge</span>
              </TabsTrigger>
              <TabsTrigger
                value="canvas"
                className="flex-1 gap-2 border-r-2 border-foreground py-3 font-black tracking-wide uppercase data-[state=active]:bg-(--brutalist-pink)"
              >
                <LuPenTool className="h-4 w-4" />
                <span className="hidden sm:inline">Canvas</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="flex-1 gap-2 py-3 font-black tracking-wide uppercase data-[state=active]:bg-(--brutalist-green)"
              >
                <LuSparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge" className="mt-0 flex-1 overflow-hidden">
              <KnowledgeBasePanel seriesId={seriesId} />
            </TabsContent>

            <TabsContent value="canvas" className="mt-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8 text-center">
                <div className="brutalist-shadow mb-4 flex h-12 w-12 items-center justify-center border-2 border-foreground bg-(--brutalist-pink)">
                  <LuPenTool className="h-6 w-6" />
                </div>
                <p className="text-sm font-black uppercase">Canvas</p>
                <p className="mt-1 text-xs text-muted-foreground">Visual planning coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8 text-center">
                <div className="brutalist-shadow mb-4 flex h-12 w-12 items-center justify-center border-2 border-foreground bg-(--brutalist-green)">
                  <LuSparkles className="h-6 w-6" />
                </div>
                <p className="text-sm font-black uppercase">AI Assistant</p>
                <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

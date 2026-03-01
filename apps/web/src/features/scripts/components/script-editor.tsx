import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import History from '@tiptap/extension-history';
import Italic from '@tiptap/extension-italic';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { Selection } from '@tiptap/pm/state';
import { EditorContent, useEditor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LuBookOpen,
  LuChevronLeft,
  LuChevronRight,
  LuKeyboard,
  LuPenTool,
  LuPlus,
  LuSparkles,
  LuX,
} from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@~/components/ui/tooltip';
import { cn } from '@~/lib/utils';

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
import { BlockMenu } from './block-menu';
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
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const [rightPanelTab, setRightPanelTab] = useState('knowledge');
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isShowingKeyboardShortcuts, setIsShowingKeyboardShortcuts] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
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

  // Scroll to bottom when editor loads - users typically edit from bottom to top
  useEffect(() => {
    if (!editor || !editorScrollRef.current) return undefined;

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      if (editorScrollRef.current) {
        editorScrollRef.current.scrollTop = editorScrollRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [editor]);

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
              // Move cursor to the new block
              tr.setSelection(Selection.near(tr.doc.resolve(endPos + 1)));
            }
          }
          return true;
        })
        .run();

      // Scroll to the new block after DOM update
      requestAnimationFrame(() => {
        if (editorScrollRef.current) {
          editorScrollRef.current.scrollTo({
            top: editorScrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
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

      <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Editor Panel */}
        <div
          className={cn(
            'flex w-full flex-col overflow-hidden border-b border-border transition-all duration-300 lg:border-r lg:border-b-0',
            isRightPanelCollapsed ? 'h-full lg:w-full' : 'h-1/2 lg:h-full lg:w-1/2',
          )}
        >
          {/* Editor Content */}
          <div ref={editorScrollRef} className="relative flex-1 overflow-y-auto pl-16">
            {editor ? <BlockMenu editor={editor} containerRef={editorScrollRef} /> : null}
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

              {/* Keyboard Shortcuts Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsShowingKeyboardShortcuts(!isShowingKeyboardShortcuts)}
                      className="ml-auto gap-1.5 text-xs text-muted-foreground"
                    >
                      <LuKeyboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Shortcuts</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show keyboard shortcuts</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Keyboard Shortcuts Panel */}
          {isShowingKeyboardShortcuts ? (
            <div className="animate-in border-t border-border bg-muted/50 p-3 slide-in-from-bottom-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Keyboard Shortcuts</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsShowingKeyboardShortcuts(false)}
                >
                  <LuX className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Enter</span>
                  <span>New block</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tab</span>
                  <span>Next type</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Shift+Tab</span>
                  <span>Previous type</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Backspace</span>
                  <span>Delete empty</span>
                </div>
                {BLOCK_TYPE_CYCLE_ORDER.map((type, index) => {
                  const config = BLOCK_CONFIG[type];
                  return (
                    <div key={type} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Ctrl+{index + 1}</span>
                      <span className="flex items-center gap-1">
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Panel Toggle Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'absolute top-2 z-50 hidden h-8 w-8 border-2 border-foreground p-0 shadow-[2px_2px_0px_rgb(0,0,0)] lg:flex',
                  isRightPanelCollapsed ? 'right-2' : 'right-[51%]',
                )}
                onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              >
                {isRightPanelCollapsed ? <LuChevronLeft className="h-4 w-4" /> : <LuChevronRight className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isRightPanelCollapsed ? 'Show panel' : 'Hide panel'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Right Panel - Knowledge Base / Canvas */}
        <div
          className={cn(
            'flex w-full flex-col overflow-hidden transition-all duration-300',
            isRightPanelCollapsed ? 'hidden lg:hidden' : 'h-1/2 lg:h-full lg:w-1/2',
          )}
        >
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

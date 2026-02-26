/**
 * Block control bar component for script editor blocks
 * Provides controls for changing block type and deleting blocks
 * Appears next to the currently focused block
 * Shows inline type selector when block is empty
 */
import type { Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuChevronDown, LuTrash2 } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@~/components/ui/tooltip';
import { cn } from '@~/lib/utils';

import { BLOCK_CONFIG } from '../helpers/block-config';
import type { ScriptBlockType } from '../types';
import { BLOCK_TYPE_CYCLE_ORDER, SCRIPT_BLOCK_TYPES } from '../types';

interface iBlockMenuProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Get the current block type and empty status from the editor selection
 */
function getCurrentBlockInfo(editor: Editor): { type: ScriptBlockType | null; isEmpty: boolean } {
  const { $from } = editor.state.selection;
  const nodeName = $from.parent.type.name;
  const isEmpty = $from.parent.textContent === '';

  // Check if it's a valid script block type
  const validTypes = Object.values(SCRIPT_BLOCK_TYPES);
  if (validTypes.includes(nodeName as ScriptBlockType)) {
    return { type: nodeName as ScriptBlockType, isEmpty };
  }
  return { type: null, isEmpty };
}

/**
 * Block control menu that floats next to the currently focused block
 * Shows inline type selector popup when block is empty
 */
export function BlockMenu({ editor, containerRef }: iBlockMenuProps) {
  const [currentType, setCurrentType] = useState<ScriptBlockType | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [position, setPosition] = useState<{ top: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;

    const blockInfo = getCurrentBlockInfo(editor);
    setCurrentType(blockInfo.type);
    setIsEmpty(blockInfo.isEmpty);

    if (!blockInfo.type) {
      setPosition(null);
      return;
    }

    // Get the DOM node for the current block
    const { from } = editor.state.selection;
    const resolvedPos = editor.state.doc.resolve(from);
    const blockStart = resolvedPos.start();

    try {
      const coords = editor.view.coordsAtPos(blockStart);
      const containerRect = containerRef.current.getBoundingClientRect();

      // Position the menu at the start of the block, accounting for scroll
      const top = coords.top - containerRect.top + containerRef.current.scrollTop;

      setPosition({ top });
    } catch {
      setPosition(null);
    }
  }, [editor, containerRef]);

  useEffect(() => {
    // Update on selection change
    editor.on('selectionUpdate', updatePosition);
    editor.on('focus', updatePosition);
    editor.on('transaction', updatePosition);

    // Initial update
    updatePosition();

    // Update on scroll
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updatePosition);
    }

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('focus', updatePosition);
      editor.off('transaction', updatePosition);
      if (container) {
        container.removeEventListener('scroll', updatePosition);
      }
    };
  }, [editor, containerRef, updatePosition]);

  const handleChangeType = (type: ScriptBlockType) => {
    editor.chain().focus().setNode(type).run();
  };

  const handleDeleteBlock = () => {
    const { state, view } = editor;
    const { $from, $to } = state.selection;

    // Don't delete the last block
    if (state.doc.childCount <= 1) {
      return;
    }

    // Get the position of the current block
    const blockStart = $from.start() - 1;
    const blockEnd = $to.end() + 1;

    // Delete the block
    const tr = state.tr.delete(Math.max(0, blockStart), Math.min(state.doc.content.size, blockEnd));

    view.dispatch(tr);
    editor.commands.focus();
  };

  if (!position || !currentType) {
    return null;
  }

  const currentConfig = BLOCK_CONFIG[currentType];
  const canDelete = editor.state.doc.childCount > 1;

  return (
    <>
      {/* Side Controls - always visible */}
      <div
        ref={menuRef}
        className="pointer-events-auto absolute left-0 z-50 flex -translate-x-full items-center gap-1 pr-2"
        style={{ top: `${position.top}px` }}
      >
        {/* Block Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-7 gap-1 border-2 border-foreground px-1.5 text-xs font-bold shadow-[2px_2px_0px_rgb(0,0,0)]',
                isEmpty && 'animate-pulse',
              )}
              style={{
                borderLeftColor: currentConfig.borderColorVar,
                borderLeftWidth: '4px',
              }}
            >
              {currentConfig.icon}
              <LuChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 border-2 border-foreground">
            {BLOCK_TYPE_CYCLE_ORDER.map((type) => {
              const config = BLOCK_CONFIG[type];
              const isActive = currentType === type;
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleChangeType(type)}
                  className={isActive ? 'bg-accent' : ''}
                >
                  <span
                    className="mr-2 flex h-5 w-5 items-center justify-center rounded-sm border"
                    style={{ borderColor: config.borderColorVar }}
                  >
                    {config.icon}
                  </span>
                  <span className="flex-1 font-medium">{config.label}</span>
                  <kbd className="rounded border border-border bg-muted px-1.5 text-[10px]">Ctrl+{config.shortcut}</kbd>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Button - always visible */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-7 w-7 border-2 border-foreground p-0 shadow-[2px_2px_0px_rgb(0,0,0)]',
                  canDelete
                    ? 'hover:text-destructive-foreground hover:bg-destructive text-destructive'
                    : 'cursor-not-allowed text-muted-foreground opacity-50',
                )}
                onClick={handleDeleteBlock}
                disabled={!canDelete}
              >
                <LuTrash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{canDelete ? 'Delete block' : 'Cannot delete last block'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Inline Type Selector - visible when block is empty */}
      {isEmpty ? (
        <div className="pointer-events-auto absolute right-4 left-4 z-40" style={{ top: `${position.top + 32}px` }}>
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border-2 border-dashed border-muted-foreground/40 bg-muted/60 p-2 backdrop-blur-sm">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Convert to:</span>
            {BLOCK_TYPE_CYCLE_ORDER.map((type) => {
              const config = BLOCK_CONFIG[type];
              const isActive = currentType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChangeType(type)}
                  className={cn(
                    'flex items-center gap-1.5 rounded border-2 px-2 py-1 text-xs font-medium transition-all',
                    'hover:scale-105 hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'border-foreground bg-accent shadow-[2px_2px_0px_rgb(0,0,0)]'
                      : 'border-transparent bg-background hover:border-border',
                  )}
                  style={{
                    borderLeftColor: config.borderColorVar,
                    borderLeftWidth: '3px',
                  }}
                >
                  {config.icon}
                  <span className="hidden sm:inline">{config.label}</span>
                </button>
              );
            })}
            <span className="ml-auto text-[10px] text-muted-foreground">Tab to cycle • Ctrl+1-6 shortcuts</span>
          </div>
        </div>
      ) : null}
    </>
  );
}

import type { Editor } from '@tiptap/react';
import { formatDistanceToNow } from 'date-fns';
import {
  LuBold,
  LuChevronDown,
  LuFileDown,
  LuItalic,
  LuLoader,
  LuPencil,
  LuRedo,
  LuSave,
  LuUnderline,
  LuUndo,
} from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@~/components/ui/tooltip';

import { BLOCK_CONFIG } from '../helpers/block-config';
import { BLOCK_TYPE_CYCLE_ORDER } from '../types';
import type { ScriptBlockType } from '../types';

interface iEditorToolbarProps {
  editor: Editor | null;
  title?: string;
  onOpenSettings?: () => void;
  onExport?: () => void;
  _onBreakdown?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  lastEditedAt?: Date;
  currentBlockType: ScriptBlockType | null;
  onChangeBlockType: (type: ScriptBlockType) => void;
}

export function EditorToolbar({
  editor,
  title,
  onOpenSettings,
  onExport,
  _onBreakdown,
  onSave,
  isSaving,
  lastEditedAt,
  currentBlockType,
  onChangeBlockType,
}: iEditorToolbarProps) {
  const currentConfig = currentBlockType ? BLOCK_CONFIG[currentBlockType] : null;

  return (
    <div className="border-b border-border bg-card">
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 md:px-3">
        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-3 text-xs font-medium">
              File
              <LuChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onSave}>
              <LuSave className="mr-2 h-4 w-4" />
              Save
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExport}>
              <LuFileDown className="mr-2 h-4 w-4" />
              Export...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-3 text-xs font-medium">
              Edit
              <LuChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => editor?.chain().focus().undo().run()}>
              <LuUndo className="mr-2 h-4 w-4" />
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().redo().run()}>
              <LuRedo className="mr-2 h-4 w-4" />
              Redo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenSettings}>
              <LuPencil className="mr-2 h-4 w-4" />
              Edit Script Details...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Format Menu - Block Type Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-3 text-xs font-medium">
              {currentConfig ? (
                <>
                  {currentConfig.icon}
                  <span className="hidden sm:inline">{currentConfig.label}</span>
                </>
              ) : (
                'Format'
              )}
              <LuChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {BLOCK_TYPE_CYCLE_ORDER.map((type) => {
              const config = BLOCK_CONFIG[type];
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onChangeBlockType(type)}
                  className={currentBlockType === type ? 'bg-accent' : ''}
                >
                  {config.icon}
                  <span className="ml-2 flex-1">{config.label}</span>
                  <kbd className="ml-2 rounded border border-border bg-muted px-1.5 text-[10px]">
                    Ctrl+{config.shortcut}
                  </kbd>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

        {/* Undo/Redo */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
              >
                <LuUndo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
              >
                <LuRedo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

        {/* Text Formatting */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${editor?.isActive('bold') ? 'bg-accent' : ''}`}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <LuBold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold (Ctrl+B)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${editor?.isActive('italic') ? 'bg-accent' : ''}`}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <LuItalic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic (Ctrl+I)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${editor?.isActive('underline') ? 'bg-accent' : ''}`}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <LuUnderline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline (Ctrl+U)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isSaving === true ? (
            <>
              <LuLoader className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : null}
          {isSaving !== true && lastEditedAt != null ? (
            <span>Saved {formatDistanceToNow(lastEditedAt, { addSuffix: true })}</span>
          ) : null}
        </div>

        {/* Title */}
        {title ? (
          <div className="ml-2 hidden items-center gap-2 md:flex">
            <span className="text-sm font-medium">{title}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
